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
        this.togglePhysicsUpdates = params.togglePhysicsUpdates;
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
            await this.endMatchMaking();
        } else {
            //only start matchmaking if player has a warrior hut? and has enough stakes?
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
        this.matchmaking = true;
    }

    async endMatchMaking(){
        //send request to server to leave matchmaking queue
        const response = await this.sendMatchMakingRequest(false);
        console.log(response);
        this.matchmaking = false;
    }


    async startMatch(playerIds){
        this.togglePhysicsUpdates();
        const progressBar = document.getElementById('progress-bar');

        progressBar.labels[0].innerText = "retrieving Opponent info...";

        this.menuManager.exitMenu();
        this.spellCaster.dispatchVisibleSpellPreviewEvent(false);
        this.inMatch = true;
        this.spellCaster.multiplayer = true;
        //TODO: totally block input and don't allow recapture of pointerlock for the duration of this method

        document.querySelector('.loading-animation').style.display = 'block';

        //get opponent info (targetId, playerInfo, islandInfo) (via the REST API) and enter loading screen
        await this.opponentInfo.retrieveInfo(playerIds['player1'] === this.playerInfo.userID ? playerIds['player2'] : playerIds['player1']);
        progressBar.value = 50;

        progressBar.labels[0].innerText = "importing Opponent's island...";

        //synchronise coordinate system of 2 islands: lowest user id island is the main island which is set to (0,0,0).
        // the other island is rotated 180 degrees around the y-axis and translated from center of main island

        //construct 2nd player object and island object and add to world
        await this.worldManager.addImportedIslandToWorld(this.opponentInfo.islandID, this.playerInfo.userID < this.opponentInfo.userID);
        progressBar.value = 75;
        // console.log(this.playerInfo.userID < this.opponentInfo.userID ? "%cI am center" : "%cOpponent is center", "color: red; font-size: 20px; font-weight: bold;")
        const opponent = this.worldManager.addOpponent({position: new THREE.Vector3(0,0,0), mana: 100, maxMana: 100, team: 1});
        opponent.setId({entity: {player_id: this.opponentInfo.userID}});
        console.log("opponent: ", opponent)
        this.peerController = new Controller.PeerController({peer: opponent});

        progressBar.labels[0].innerText = "creating paths for minions...";
        //TODO: construct worldmap and instantiate minionSpawners
        this.minionController.worldMap = this.worldManager.world.islands;
        this.worldManager.generateMinionSpawners(this.minionController);

        //start sending state updates to server
        this.startSendingStateUpdates(this.opponentInfo.userID);
        //start receiving state updates from server
        document.querySelector('.loading-animation').style.display = 'none';
        this.togglePhysicsUpdates();
    }

    endMatch(){
        this.spellCaster.multiplayer = false;
        this.worldManager.clearMinionSpawners();
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
            spellData.params.team = 1;
            spellData.params.playerID = this.opponentInfo.userID;
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

    sendPlayerStateUpdate(event){
        this.forwardingNameSpace.sendTo(this.opponentInfo.userID, {
            player: {
                state: event.detail.state
            }
        });
    }


    startSendingStateUpdates(opponentId){
        //send created objects (minions, spells)
            // => how to do this? do we
            // A) just send state of all objects,
            // B) send a list of all objects created since the last update so that opponent can create them as well
        this.spellCaster.addEventListener("createSpellEntity", this.sendCreateSpellEntityEvent.bind(this));
        this.worldManager.world.player.addEventListener("updatedState", this.sendPlayerStateUpdate.bind(this));
        this.updateInterval = setInterval(() => {
            // Send state update to server
            //player state (position, rotation, health) => just check playerModel
            this.forwardingNameSpace.sendTo(opponentId, {
                player: {
                    position: this.worldManager.world.player.position,
                    phi: this.worldManager.world.player.phi,
                    health: this.worldManager.world.player.health
                }
            });
        }, 16); //TODO: change this value to sync with fps (maybe sync it with other player?)
    }

    stopSendingStateUpdates(){
        clearInterval(this.updateInterval);
        this.updateInterval = null;
        this.spellCaster.removeEventListener("createSpellEntity", this.sendCreateSpellEntityEvent.bind(this));
        this.worldManager.world.player.removeEventListener("updatedState", this.sendPlayerStateUpdate.bind(this));
    }
}