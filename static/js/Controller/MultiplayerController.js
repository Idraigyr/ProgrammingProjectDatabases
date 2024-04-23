import {API_URL, matchMakingURI} from "../configs/EndpointConfigs.js";
import {UserInfo} from "./UserInfo.js";
import * as THREE from "three";
import {Controller} from "./Controller.js";
import {spellTypes} from "../Model/Spell.js";

/**
 * MultiplayerController class
 */
export class MultiplayerController{
    playerInfo;
    menuManager;
    worldManager;
    spellCaster;
    minionController;
    forwardingNameSpace;
    peerController;
    updateInterval;
    constructor(params) {
        //for remembering the interval for sending state updates
        this.matchmaking = false;
        this.inMatch = false;
        this.opponentInfo = new UserInfo();
    }

    async sendMatchMakingRequest(matchmake = true){
        try {
            $.ajax({
                url: `${API_URL}/${matchMakingURI}`,
                type: "PUT",
                data: JSON.stringify({matchmake: matchmake}),
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.error(e);
                }
            }).done((data, textStatus, jqXHR) => {
                console.log("PUT success");
                console.log(textStatus, data);
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log("PUT fail");
                console.log(textStatus, errorThrown);
            });
        } catch (err){
            console.error(err);
        }
    }

    setUpProperties(params){
        this.playerInfo = params.playerInfo;
        this.menuManager = params.menuManager;
        this.worldManager = params.worldManager;
        this.spellCaster = params.spellCaster;
        this.minionController = params.minionController;
        this.forwardingNameSpace = params.forwardingNameSpace;
        this.spellFactory = params.spellFactory;
    }

    async toggleMatchMaking(){
        if(this.matchmaking){
            this.matchmaking = false;
            await this.endMatchMaking();
        } else {
            this.matchmaking = true;
            await this.startMatchMaking();
        }
    }

    async startMatchMaking(){
        //send request to server to join matchmaking queue
        const response = await this.sendMatchMakingRequest(true);
        console.log(response);
        //wait for match to start
        //when opponent found, get opponent info (targetId, playerInfo, islandInfo) (via the REST API) and enter loading screen
        //start the match
    }

    async endMatchMaking(){
        //send request to server to leave matchmaking queue
        const response = await this.sendMatchMakingRequest(false);
        console.log(response);
    }



    async startMatch(playerIds){
        this.menuManager.exitMenu();
        this.spellCaster.dispatchVisibleSpellPreviewEvent(false);
        this.inMatch = true;
        this.spellCaster.multiplayer = true;
        //TODO: totally block input and don't allow recapture of pointerlock for the duration of this method

        // document.querySelector('.loading-animation').style.display = 'block';
        const progressBar = document.getElementById('progress-bar');

        progressBar.labels[0].innerText = "retrieving Opponent info...";

        //get opponent info (targetId, playerInfo, islandInfo) (via the REST API) and enter loading screen
        await this.opponentInfo.retrieveInfo(playerIds['player1'] === this.playerInfo.userID ? playerIds['player2'] : playerIds['player1']);

        progressBar.labels[0].innerText = "importing Opponent's island...";

        //synchronise coordinate system of 2 islands: lowest user id island is the main island which is set to (0,0,0).
        // the other island is rotated 180 degrees around the y-axis and translated from center of main island

        //construct 2nd player object and island object and add to world
        await this.worldManager.addImportedIslandToWorld(this.opponentInfo.islandID, this.playerInfo.userID > this.opponentInfo.userID);
        console.log(this.playerInfo.userID < this.opponentInfo.userID ? "%cI am center" : "%cOpponent is center", "color: red; font-size: 20px; font-weight: bold;")
        console.log(this.worldManager.world.islands);
        const opponent = this.worldManager.addOpponent({position: new THREE.Vector3(0,0,0), mana: 100, maxMana: 100, team: 1});
        this.peerController = new Controller.PeerController({peer: opponent});

        //TODO: construct worldmap and instantiate minionSpawners
        this.minionController.worldMap = this.worldManager.world.islands;

        //start sending state updates to server
        this.startSendingStateUpdates(this.opponentInfo.userID);
        //start receiving state updates from server
        // document.querySelector('.loading-animation').style.display = 'none';

    }

    endMatch(){
        this.spellCaster.multiplayer = false;
        //stop sending state updates to server
        this.stopSendingStateUpdates();
        //stop receiving state updates from server
        //remove island from world
    }

    async processReceivedState(data){
        const sender = data.sender // sender user id
        const target = data.target // target user id
        if (sender === target) {
            // Another session of our player emitted this message, probably should update our internal state as well
        }
        const playerData = data.player;
        const spellData = data.spellEvent;
        const minionData = data.minions;
        if(playerData) this.peerController.update(playerData);
        if(spellData) {
            spellData.type = spellTypes[spellData.type];
            for (const property in spellData.params) {
                //assume that if a property has x, it has y and z as well (meaning data.spellEvent never contains properties with separate x, y, z values)
                if(spellData.params[property]?.x) spellData.params[property] = new THREE.Vector3(
                    spellData.params[property].x,
                    spellData.params[property].y,
                    spellData.params[property].z
                );
            }
            this.spellFactory.createSpell({detail: spellData});
        }

        // console.log(data); // eg { target: <this_user_id>, ... (other custom attributes) }
    }

    sendCreateSpellEntityEvent(event){
        event.detail.type = event.detail.type.name;
        this.forwardingNameSpace.sendTo(this.opponentInfo.userID, {
            spellEvent: event.detail
        });
    }


    startSendingStateUpdates(opponentId){
        //send created objects (minions, spells)
            // => how to do this? do we
            // A) just send state of all objects,
            // B) send a list of all objects created since the last update so that opponent can create them as well
        this.spellCaster.addEventListener("createSpellEntity", this.sendCreateSpellEntityEvent.bind(this));
        this.updateInterval = setInterval(() => {
            // Send state update to server
            //player state (position, rotation, health) => just check playerModel
            this.forwardingNameSpace.sendTo(opponentId, {
                player: {
                    position: this.worldManager.world.player.position,
                    phi: this.worldManager.world.player.phi,
                    state: this.worldManager.world.player.fsm.currentState.name,
                    health: this.worldManager.world.player.health
                }
            });
        }, 16); //TODO: change this value to sync with fps (maybe sync it with other player?)
    }

    stopSendingStateUpdates(){
        clearInterval(this.updateInterval);
        this.updateInterval = null;
        this.spellCaster.removeEventListener("createSpellEntity", this.sendCreateSpellEntityEvent.bind(this));
    }
}