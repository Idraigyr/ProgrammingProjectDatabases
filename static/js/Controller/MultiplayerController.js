import {API_URL, matchMakingURI} from "../configs/EndpointConfigs.js";
import {PlayerInfo} from "./PlayerInfo.js";
import * as THREE from "three";
import {Controller} from "./Controller.js";
import {spellTypes} from "../Model/Spell.js";
import {formatSeconds} from "../helpers.js";
import {Subject} from "../Patterns/Subject.js";

/**
 * MultiplayerController class
 */
export class MultiplayerController extends Subject{
    playerInfo;
    menuManager;
    worldManager;
    itemManager;
    spellCaster;
    minionController;
    forwardingNameSpace;
    peerController;
    updateInterval;
    matchId = null;
    constructor(params) {
        super(params);
        //for remembering the interval for sending state updates
        this.matchmaking = false;
        this.inMatch = false;
        this.opponentInfo = new PlayerInfo();
        this.togglePhysicsUpdates = params.togglePhysicsUpdates;

        this.updateEvents = new Map();
        this.updateEvents.set("updatedState", this.sendPlayerStateUpdate.bind(this));
        this.updateEvents.set("createSpellEntity", this.sendCreateSpellEntityEvent.bind(this));
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

    /**
     * add all the necessary controllers and managers to the MultiplayerController
     * @param {{playerInfo: PlayerInfo, menuManager: MenuManager, worldManager, WorldManager, spellCaster: SpellCaster, minionController: MinionController, forwardingNameSpace: ForwardingNameSpace, spellFactory: SpellFactory, itemManager: ItemManager}} params
     */
    setUpProperties(params){
        this.playerInfo = params.playerInfo;
        this.menuManager = params.menuManager;
        this.worldManager = params.worldManager;
        this.spellCaster = params.spellCaster;
        this.minionController = params.minionController;
        this.forwardingNameSpace = params.forwardingNameSpace;
        this.spellFactory = params.spellFactory;
        this.itemManager = params.itemManager;
    }

    /**
     * Creates a custom event for announcing the toggling of matchmaking
     * @return {CustomEvent<{matchmaking: boolean}>}
     */
    createMatchmakingEvent(){
        return new CustomEvent("toggleMatchMaking", {detail: {matchmaking: this.matchmaking}});
    }

    /**
     * turns matchmaking on or off
     * @param {boolean | null} bool - optional parameter true to start matchmaking, false to stop it
     * @return {Promise<void>}
     */
    async toggleMatchMaking(bool = null){ //TODO: refactor; is pretty confusing because menuManager (play-buton is pressed) => this method => menuManager update the view
        //matchmake = do we want to matchmake or not?
        const matchmake = bool ?? !this.matchmaking;
        console.log(" I want to matchmake: ", matchmake)
        if(bool === this.matchmaking ?? false) return;
        if(matchmake){
            //TODO: only start matchmaking if player has a warrior hut?
            if(!this.itemManager.checkStakedGems()) return;
            try{
                await this.startMatchMaking();
            } catch (err){
                //TODO: handle pathfinding error (no path to altar) => show error message to player
                console.error(err);
                await this.endMatchMaking();
            }
        } else {
            await this.endMatchMaking();
        }
        this.dispatchEvent(this.createMatchmakingEvent());
    }

    async startMatchMaking(){
        //TODO: first test if path is available to altar if not throw error

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

    /**
     * Updates the game timer
     * @param data
     * @return {Promise<void>}
     */
    async updateMatchTimer(data){
        const timer = document.getElementById('game-timer');
        timer.innerText = formatSeconds(data.time_left);
    }

    /**
     * Toggles the visibility of the game timer
     * @param {boolean | null} bool - optional parameter true to show the timer, false to hide it
     */
    toggleTimer(bool= null){
        const timer = document.querySelector('.game-timer-container');
        timer.style.display = (bool ? 'flex' : 'none') ?? (timer.style.display === 'none' ? 'flex' : 'none');
    }


    /**
     * Loads the match and stops physics updates while loading
     * @param {{player1: number, player2: number, matchId: number}} matchInfo
     * @return {Promise<void>}
     */
    async loadMatch(matchInfo){
        console.log("loading match...");
        this.matchId = matchInfo['match_id'];
        this.matchmaking = false;
        this.dispatchEvent(this.createMatchmakingEvent());
        this.togglePhysicsUpdates();
        this.toggleTimer(true);
        const progressBar = document.getElementById('progress-bar');

        progressBar.labels[0].innerText = "retrieving Opponent info...";

        this.menuManager.exitMenu();
        this.spellCaster.dispatchVisibleSpellPreviewEvent(false);
        this.inMatch = true;
        this.spellCaster.multiplayer = true;
        //TODO: totally block input and don't allow recapture of pointerlock for the duration of this method

        document.querySelector('.loading-animation').style.display = 'block';

        //get opponent info (targetId, playerInfo, islandInfo) (via the REST API) and enter loading screen
        await this.opponentInfo.retrieveInfo(matchInfo['player1'] === this.playerInfo.userID ? matchInfo['player2'] : matchInfo['player1']);
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
        this.worldManager.generateMinionSpawners(this.minionController, {interval: 1, maxSpawn: 1});

        //start sending state updates to server
        this.startSendingStateUpdates(this.opponentInfo.userID);
        //announce to the server that the player is ready to start the match
        this.forwardingNameSpace.sendPlayerReadyEvent(this.matchId);
    }

    /**
     * Starts the match and resumes physics updates
     */
    startMatch(){
        console.log("match started");
        this.inMatch = true;
        document.querySelector('.loading-animation').style.display = 'none';
        this.togglePhysicsUpdates();
    }

    /**
     * Ends the match and shows the win/lose/draw screen
     * @param data
     */
    endMatch(data){
        console.log(`match ended, winner: ${data.winner_id}`); //TODO: let backend also send won or lost gem ids
        if(data.winner_id === this.playerInfo.userID){
            //show win screen
            //TODO: add new gems to player's inventory
            for(const gem of this.itemManager.getStakedGems()) {
                gem.staked = false;
            }
            console.log("you win");
        } else if (data.winner_id === this.opponentInfo.userID){
            //show lose screen
            for(const gem of this.itemManager.getStakedGems()) {
                this.itemManager.deleteGem(gem);
                this.menuManager.removeItem(gem.getItemId());
            }
            console.log("you lose");
        } else {
            //show draw screen
            console.log("draw");
        }
        //wait for player to click on continue button
        //send event to server that player is leaving match
        this.leaveMatch();
    }

    /**
     * Leaves the match => sets the game state back to single player
     */
    leaveMatch(){
        console.log("leaving match");
        const progressBar = document.getElementById('progress-bar');
        progressBar.labels[0].innerText = "leaving match...";
        document.querySelector('.loading-animation').style.display = 'block';
        this.togglePhysicsUpdates();

        this.forwardingNameSpace.sendPlayerLeavingEvent(this.matchId);
        this.spellCaster.multiplayer = false;
        this.spellCaster.onSpellSwitch({detail: {spellSlot: this.worldManager.world.player.currentSpell++}}); //reset spellView
        //remove island from world and remove spawners
        this.peerController.peer = null;
        this.minionController.clearMinions();
        this.worldManager.resetWorldState(this.playerInfo.userID < this.opponentInfo.userID);
        //stop sending state updates to server
        this.stopSendingStateUpdates();
        //stop receiving state updates from server
        document.querySelector('.loading-animation').style.display = 'none';
        this.toggleTimer(false);
        this.inMatch = false;
        this.togglePhysicsUpdates();
        console.log("done leaving match");
    }

    abortMatch(){

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

        this.spellCaster.addEventListener("createSpellEntity", this.updateEvents.get("createSpellEntity"));
        this.worldManager.world.player.addEventListener("updatedState", this.updateEvents.get("updatedState"));
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
        this.spellCaster.removeEventListener("createSpellEntity", this.updateEvents.get("createSpellEntity"));
        this.worldManager.world.player.removeEventListener("updatedState", this.updateEvents.get("updatedState"));
    }
}