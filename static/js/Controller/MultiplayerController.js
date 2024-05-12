import {API_URL, matchMakingURI} from "../configs/EndpointConfigs.js";
import {PlayerInfo} from "./PlayerInfo.js";
import * as THREE from "three";
import {Controller} from "./Controller.js";
import {Fireball, spellTypes} from "../Model/Spell.js";
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
    spellFactory;
    factory;
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
        this.updateEvents.set("updatedMinionState", this.sendMinionsStateUpdate.bind(this));
        this.updateEvents.set("createSpellEntity", this.sendCreateSpellEntityEvent.bind(this));
        this.updateEvents.set("createMinion", this.sendCreateMinionEvent.bind(this));
        this.updateEvents.set("minionHealthUpdate", this.sendEnemyHealthUpdate.bind(this));
        this.updateEvents.set("playerHealthUpdate", this.sendPlayerHealthUpdate.bind(this));
        this.updateEvents.set("minionDeath", this.enemyDeathEvent.bind(this));
        this.updateEvents.set("playerDeath", this.sendPlayerDeathEvent.bind(this));
        this.updateEvents.set("proxyHealthUpdate", this.sendProxyHealthUpdate.bind(this));
        this.updateEvents.set("proxyDeath", this.proxyDeathEvent.bind(this));

        this.stats = new Map();
        this.stats.set("playerKills", 0);
        this.stats.set("minionsKilled", 0);
        this.stats.set("deaths", 0);
        this.stats.set("damageDealt", 0);
        this.stats.set("damageTaken", 0);
        this.stats.set("manaSpent", 0);
        this.stats.set("spellCasts", 0);
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
     * @param {{playerInfo: PlayerInfo, menuManager: MenuManager, worldManager, WorldManager, spellCaster: SpellCaster, minionController: MinionController, forwardingNameSpace: ForwardingNameSpace, spellFactory: SpellFactory, factory: Factory, itemManager: ItemManager}} params
     */
    setUpProperties(params){
        this.playerInfo = params.playerInfo;
        this.menuManager = params.menuManager;
        this.worldManager = params.worldManager;
        this.spellCaster = params.spellCaster;
        this.minionController = params.minionController;
        this.forwardingNameSpace = params.forwardingNameSpace;
        this.spellFactory = params.spellFactory;
        this.factory = params.factory;
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
    async toggleMatchMaking(bool = null){
        //TODO: refactor; is pretty confusing because menuManager (play-buton is pressed) => this method => menuManager update the view
        //matchmake = do we want to matchmake or not?
        const matchmake = bool ?? !this.matchmaking;
        if(bool === this.matchmaking ?? false) return;
        if(matchmake){
            if(!this.itemManager.checkStakedGems()) return;
            try{
                await this.startMatchMaking();
            } catch (err){
                console.error(err);
                //TODO: handle pathfinding error (no path to altar) => show error message to player
            }
        } else {
            await this.endMatchMaking();
        }
        this.dispatchEvent(this.createMatchmakingEvent());
    }

    async startMatchMaking(){
        //TODO: first test if path is available to altar if not throw error
        const connectionPoint = this.worldManager.getIslandConnectionPoint();
        if(this.worldManager.world.getBuildingByPosition(connectionPoint)) throw new Error("Connection point is occupied by a building");
        const altarPosition = this.worldManager.getAltarPosition();
        console.log("connection point: ", connectionPoint);
        console.log("altar position: ", altarPosition);
        if(!(this.minionController.testPath(this.worldManager.world.islands, this.worldManager.getIslandConnectionPoint(), this.worldManager.getAltarPosition()))) throw new Error("No path from connection point to altar");
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
        const opponent = this.worldManager.addOpponent({
            position: this.opponentInfo.playerPosition,
            health: this.opponentInfo.maxHealth,
            maxHealth: this.opponentInfo.maxHealth,
            team: 1
        });
        opponent.setId({entity: {player_id: this.opponentInfo.userID}});
        console.log("opponent: ", opponent)
        this.peerController = new Controller.PeerController({peer: opponent});

        progressBar.labels[0].innerText = "creating proxys for buildings...";
        this.worldManager.generateProxys();
        progressBar.value = 80;

        progressBar.labels[0].innerText = "creating paths for minions...";
        //TODO: construct worldmap and instantiate minionSpawners
        this.minionController.worldMap = this.worldManager.world.islands;
        progressBar.value = 90;

        this.worldManager.generateMinionSpawners(this.minionController, {interval: 3, maxSpawn: 1});
        this.worldManager.generateSpellSpawners({
            spell: {
                type: new Fireball({}),
                params: {
                    damage: 20,
                    velocity: 70,
                    duration: 4,
                }
            },
            interval: 5
        });

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
     * Ends the match and shows the win/lose/draw screen (is called when the server sends the match end event)
     * @param data
     */
    async endMatch(data){
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
        this.menuManager.unstakeGems();
        this.menuManager.addItems(this.itemManager.updateGems(await this.playerInfo.retrieveGems()));
        //wait for player to click on continue button
        //send event to server that player is leaving match
        this.unloadMatch();
    }

    /**
     * sets the game state back to single player
     */
    unloadMatch(){
        console.log("leaving match");
        const progressBar = document.getElementById('progress-bar');
        progressBar.labels[0].innerText = "leaving match...";
        document.querySelector('.loading-animation').style.display = 'block';
        this.togglePhysicsUpdates();

        this.spellCaster.multiplayer = false;
        //stop sending state updates to server & remove event listeners
        this.stopSendingStateUpdates();
        this.spellCaster.onSpellSwitch({detail: {spellSlot: this.worldManager.world.player.currentSpell++}}); //reset spellView TODO: does not work currently
        //remove island from world and remove spawners
        //!! important: remove reference to peer only after removing all event listeners !! (happens in stopSendingStateUpdates)
        this.peerController.peer = null;
        this.minionController.clearMinions();
        this.worldManager.resetWorldState(this.playerInfo.userID < this.opponentInfo.userID);
        //stop receiving state updates from server
        document.querySelector('.loading-animation').style.display = 'none';
        this.toggleTimer(false);
        this.inMatch = false;
        this.togglePhysicsUpdates();
        console.log("done leaving match");
    }

    /**
     * sends a message to the server that the player is leaving the match
     */
    leaveMatch(){
        if (confirm("Are you sure you want to leave the match?\nYou will lose your stakes!")) {
            this.forwardingNameSpace.sendPlayerLeavingEvent(this.matchId);
        }
    }

    /**
     * Process the received state from the server
     * @param {{sender: number, target: number, player: Object, playerHealth: Object, proxy: Object, spellEvent: Object, minions: Object}} data - check send methods for more info about what data can contain
     * in general: data can contain player which is the peer's state, playerHealth which is your own player's health (peer's front-end is responsible for updating your team's health), spellEvent which is the event that creates a spell (of peer),
     * minions which can contain create, update, state (all for enemey minions) and healthUpdate (for friendly minions)
     * @return {Promise<void>}
     */
    async processReceivedState(data){
        const sender = data.sender // sender user id
        const target = data.target // target user id
        if(data.player) {
            this.peerController.update(data.player);
        }
        if(data.playerHealth){
            this.stats.set("damageTaken", this.stats.get("damageTaken") + data.playerHealth.previous - data.playerHealth.current);
            this.worldManager.world.player.takeDamage(data.playerHealth.previous - data.playerHealth.current);
        }
        if(data.spellEvent) {
            data.spellEvent.type = spellTypes[data.spellEvent.type];
            for (const property in data.spellEvent.params) {
                //assume that if a property has x, it has y and z as well (meaning data.spellEvent never contains properties with separate x, y, z values)
                if(data.spellEvent.params[property]?.x) data.spellEvent.params[property] = new THREE.Vector3(
                    data.spellEvent.params[property].x,
                    data.spellEvent.params[property].y,
                    data.spellEvent.params[property].z
                );
            }
            data.spellEvent.params.team = 1;
            data.spellEvent.params.playerID = this.opponentInfo.userID;
            this.spellFactory.createSpell({detail: {...data.spellEvent, canDamage: false}});
        }
        if(data.minions){
            if(data.minions.create){
                for (const property in data.minions.create) {
                    //assume that if a property has x, it has y and z as well (meaning data.minions.create never contains properties with separate x, y, z values)
                    if(data.minions.create[property]?.x) data.minions.create[property] = new THREE.Vector3(
                        data.minions.create[property].x,
                        data.minions.create[property].y,
                        data.minions.create[property].z
                    );
                }
                //create a minion
                // add an eventListener to the enemy minion so damage taken can be forwarded to the opponent
                const minion = this.factory.createMinion({...data.minions.create, team: 1});
                minion.addEventListener("updateHealth", this.updateEvents.get("minionHealthUpdate"));
                minion.addEventListener("delete", this.updateEvents.get("minionDeath"));
                minion.setId(data.minions.create);
                this.minionController.addEnemy(minion);
            }
            if(data.minions.update){
                this.minionController.updateEnemies(data.minions.update);
            }
            if(data.minions.state){
                this.minionController.updateEnemyState(data.minions.state);
            }

            if(data.minions.healthUpdate){
                this.minionController.updateFriendlyState(data.minions.healthUpdate);
            }
        }
        if(data.proxy){
            if(data.proxy.healthUpdate){

                const proxy = this.worldManager.getProxyByBuildingID(data.proxy.healthUpdate.id);
                if(proxy) proxy.takeDamage(data.proxy.healthUpdate.previous - data.proxy.healthUpdate.current);
                else throw new Error("Proxy not found");
            }
        }

        // console.log(data); // eg { target: <this_user_id>, ... (other custom attributes) }
    }

    /**
     * Send the spell creation event to the opponent
     * @param event
     */
    sendCreateSpellEntityEvent(event){

        event.detail.type = event.detail.type.name;
        this.forwardingNameSpace.sendTo(this.opponentInfo.userID, {
            spellEvent: event.detail
        });
    }

    /**
     * Send the minion creation event to the opponent
     * @param event
     */
    sendCreateMinionEvent(event){
        const createParams = {
            type: event.detail.minion.minionType,
            spawn: event.detail.minion.spawnPoint,
            id: event.detail.minion.id,
        }
        this.forwardingNameSpace.sendTo(this.opponentInfo.userID, {
            minions: {
                create: createParams
            }
        });
        event.detail.minion.addEventListener("updatedState", this.updateEvents.get("updatedMinionState"));
    }

    /**
     * Send the minion state update to the opponent
     * @param {{detail: {id: number, position: THREE.Vector3, phi: number, health: number}}} event - phi = in degrees
     */
    sendMinionsStateUpdate(event){
        this.forwardingNameSpace.sendTo(this.opponentInfo.userID, {
            minions: {
                state: event.detail
            }
        });
    }

    /**
     * Send the minion health update to the opponent
     * @param {{detail: {health: number, id: number}}} event
     */
    sendEnemyHealthUpdate(event){
        this.stats.set("damageDealt", this.stats.get("damageDealt") + event.detail.previous - event.detail.current);
        this.forwardingNameSpace.sendTo(this.opponentInfo.userID, {
            minions: {
                healthUpdate: {health: event.detail.current, id: event.detail.id}
            }
        });
    }

    /**
     * Send the player state update to the opponent
     * @param {{detail: {state: {position: THREE.Vector3, phi: number, health}}}} event - phi = in degrees
     */
    sendPlayerStateUpdate(event){
        this.forwardingNameSpace.sendTo(this.opponentInfo.userID, {
            player: {
                state: event.detail.state
            }
        });
    }

    /**
     * Send the opponent's health update to the opponent
     * @param {{detail: {health: number}}} event
     */
    sendPlayerHealthUpdate(event){
        this.stats.set("damageDealt", this.stats.get("damageDealt") + event.detail.previous - event.detail.current);
        this.forwardingNameSpace.sendTo(this.opponentInfo.userID, {
            playerHealth: event.detail
        });
    }

    /**
     * removes event listeners from enemy minion
     * @param event
     */
    enemyDeathEvent(event){
        this.stats.set("minionsKilled", this.stats.get("minionsKilled") + 1);
        event.detail.model.removeEventListener("updatedHealth", this.updateEvents.get("minionHealthUpdate"));
        event.detail.model.removeEventListener("delete", this.updateEvents.get("minionDeath"));
    }

    /**
     * Send the player death event to the opponent (to notify the opponent that he has died)
     * @param event
     */
    sendPlayerDeathEvent(event){
        this.stats.set("playerKills", this.stats.get("playerKills") + 1);
        this.forwardingNameSpace.sendTo(this.opponentInfo.userID, {
            player: {
                death: event.detail
            }
        });
    }

    /**
     * Send the proxy health update to the opponent
     * @param event
     */
    sendProxyHealthUpdate(event){
        console.log("proxy health update")
        this.forwardingNameSpace.sendTo(this.opponentInfo.userID, {
            proxy: {
                healthUpdate: event.detail
            }
        });
    }

    /**
     * removes event listeners from proxy object
     * @param event
     */
    proxyDeathEvent(event){
        event.detail.model.removeEventListener("updateHealth", this.updateEvents.get("minionHealthUpdate"));
        event.detail.model.removeEventListener("delete", this.updateEvents.get("minionDeath"));
        if(event.detail.model.dbType === "altar_building" && event.detail.model.team !== 0){
            console.log("altar destroyed");
            this.forwardingNameSpace.sendAltarDestroyedEvent(this.matchId);
        } else {
            console.log("a proxy destroyed");
        }
    }


    /**
     * Starts sending state updates to the server
     * @param {number} opponentId
     */
    startSendingStateUpdates(opponentId){
        this.peerController.peer.addEventListener("updateHealth", this.updateEvents.get("playerHealthUpdate"));
        //TODO: attach event listeners to all proxy objects (buildings) and send their health updates to the opponent
        this.worldManager.world.getProxys().forEach(proxy => {
            proxy.addEventListener("updateHealth", this.updateEvents.get("proxyHealthUpdate"));
            proxy.addEventListener("delete", this.updateEvents.get("proxyDeath"));
        });
        this.worldManager.world.spawners.spells.forEach(spawner => {
            spawner.addEventListener("spawn", this.updateEvents.get("createSpellEntity"));
        });
        this.spellCaster.addEventListener("createSpellEntity", this.updateEvents.get("createSpellEntity"));
        this.worldManager.world.player.addEventListener("updatedState", this.updateEvents.get("updatedState"));
        this.minionController.addEventListener("minionAdded", this.updateEvents.get("createMinion"));
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
            //minion state (position, rotation, health) => just check minionModel
            this.forwardingNameSpace.sendTo(opponentId, {
                minions: {
                    update: this.minionController.getMinionsState()
                }
            });
        }, 16); //TODO: change this value to sync with fps (maybe sync it with other player?)
    }

    /**
     * Stops sending state updates to the server and removes the event listeners
     */
    stopSendingStateUpdates(){
        clearInterval(this.updateInterval);
        this.updateInterval = null;
        this.peerController.peer.removeEventListener("updateHealth", this.updateEvents.get("playerHealthUpdate"));
        this.spellCaster.removeEventListener("createSpellEntity", this.updateEvents.get("createSpellEntity"));
        this.worldManager.world.player.removeEventListener("updatedState", this.updateEvents.get("updatedState"));
        // spawners and minions are removed when the match ends but we need to remove the event listeners in order to prevent memory leaks
        this.minionController.minions.forEach(minion => { //TODO: do this also when a minion dies
            minion.removeEventListener("updatedState", this.updateEvents.get("updatedMinionState"));
        });
        this.worldManager.world.spawners.spells.forEach(spawner => {
            spawner.removeEventListener("spawn", this.updateEvents.get("createSpellEntity"));
        });
        this.minionController.removeEventListener("minionAdded", this.updateEvents.get("addMinionStateListener"));
    }
}