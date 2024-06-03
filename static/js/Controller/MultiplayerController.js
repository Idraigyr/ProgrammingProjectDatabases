import {API_URL, matchMakingURI, playerStatsURI, postRetries} from "../configs/EndpointConfigs.js";
import {PlayerInfo} from "./PlayerInfo.js";
import * as THREE from "three";
import {Controller} from "./Controller.js";
import {Fireball, spellTypes} from "../Model/Spell.js";
import {formatSeconds} from "../helpers.js";
import {Subject} from "../Patterns/Subject.js";
import {multiplayerStats} from "../configs/Enums.js";
import {passiveManaGenerationAmount, passiveManaGenerationInterval} from "../configs/ControllerConfigs.js";
import {alertPopUp} from "../external/LevelUp.js";
import {loadingScreen} from "./LoadingScreen.js";

/**
 * MultiplayerController class
 */
export class MultiplayerController extends Subject{
    playerInfo;
    menuManager;
    worldManager;
    itemManager;
    viewManager;
    spellCaster;
    spellFactory;
    factory;
    minionController;
    forwardingNameSpace;
    peerController;
    updateInterval;
    #matchId = null;
    characterController;
    constructor(params) {
        super(params);
        this.canMatchmake = true;
        this.matchmaking = false;
        this.inMatch = false;
        this.result = null;
        this.stakedGems = [];
        this.peerInfo = new PlayerInfo();
        this.togglePhysicsUpdates = params.togglePhysicsUpdates;
        this.friendsMenu = params.friendsMenu;
        this.state = "singlePlayer"; // singlePlayer, matchmaking, inMatch, visiting, visited


        //Friend visit properties
        this.pendingVisitRequest = null;
        this.notificationContainer = document.getElementById("friends-notification-container");
        // this.friendsMenu = document.getElementById("Friends");
        document.querySelector("#listFriend").addEventListener("click", this.#toggleVisitRequest.bind(this));

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
        this.updateEvents.set("shieldUpdate", this.sendShieldUpdate.bind(this));
        this.updateEvents.set("eatingEvent", this.sendEatingEvent.bind(this));

        this.countStats = false;
        this.stats = new Map();
        this.lifetimeStats = new Map();
    }


    /**
     * sets the lifetime stats of the player (& initializes the current stats)
     * call on game load! (after playerInfo is set)
     */
    #setLifetimeStats(){
        this.#getLifetimeStats().then((data) => {
            for(const property in data){
                if(property === "player_id") continue;
                this.lifetimeStats.set(property, data[property]);
                this.stats.set(property, 0);
            }
        });
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
     * add all the necessary controllers and managers to the MultiplayerController + initialize the stats properties
     * @param {{playerInfo: PlayerInfo, menuManager: MenuManager, worldManager, WorldManager, spellCaster: SpellCaster,
     * minionController: MinionController, forwardingNameSpace: ForwardingNameSpace, spellFactory: SpellFactory,
     * factory: Factory, itemManager: ItemManager, viewManager: ViewManager, characterController: CharacterController}} params
     */
    setUpProperties(params){
        this.playerInfo = params.playerInfo;
        this.#setLifetimeStats();
        this.menuManager = params.menuManager;
        this.worldManager = params.worldManager;
        this.spellCaster = params.spellCaster;
        this.minionController = params.minionController;
        this.forwardingNameSpace = params.forwardingNameSpace;
        this.spellFactory = params.spellFactory;
        this.factory = params.factory;
        this.itemManager = params.itemManager;
        this.viewManager = params.viewManager;
        this.characterController = params.characterController;
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
        if(!this.canMatchmake) {
            const message = this.pendingVisitRequest ?
                "You can't start matchmaking while you have a pending visit request, cancel it first." :
                "You can't start matchmaking while you are being visited by a friend, kick him out first.";
            alertPopUp(message);
            return;
        }
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
                alertPopUp(err.message);
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
        if(this.worldManager.world.getBuildingByPosition(connectionPoint)) throw new Error("Can't start match: Connection point is occupied by a building");
        const altarPosition = this.worldManager.getAltarPosition();
        if(!(this.minionController.testPath(this.worldManager.world.islands, this.worldManager.getIslandConnectionPoint(), this.worldManager.getAltarPosition()))) throw new Error("Can't start match: No path from connection point to altar");
        //send request to server to join matchmaking queue
        const response = await this.sendMatchMakingRequest(true);
        console.log(response);
        //wait for match to start
        //when opponent found, get opponent info (targetId, playerInfo, islandInfo) (via the REST API) and enter loading screen
        //start the match
        this.matchmaking = true;
        this.countStats = true;
    }

    async endMatchMaking(){
        //send request to server to leave matchmaking queue
        const response = await this.sendMatchMakingRequest(false);
        console.log(response);
        this.matchmaking = false;
        this.countStats = false;
    }

    /**
     * Updates the game timer & adds generation of resources (currently only mana generation)
     * @param data
     * @return {Promise<void>}
     */
    async updateMatchTimer(data){
        const timer = document.getElementById('game-timer');
        timer.innerText = formatSeconds(data.time_left);
        if(data.time_left % passiveManaGenerationInterval === 0){
            this.worldManager.world.player.changeCurrentMana(passiveManaGenerationAmount);
        }
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
     * changes the text of the leave match button in the settings menu and hides/shows the apply button
     */
    toggleLeaveMatchButton(){
        const applyButton = document.querySelector(`.applyButton`);
        switch (this.state) {
            case "visiting":
                document.getElementById("leaveMatchButton").innerText = "Leave Island";
                applyButton.classList.add('hide');
                break;
            case "visited":
                document.getElementById("leaveMatchButton").innerText = "Kick Friend";
                applyButton.classList.add('hide');
                break;
            case "singlePlayer":
                applyButton.classList.remove('hide');
                break;
            case "inMatch":
                applyButton.classList.add('hide');
                break;
            default:
                document.getElementById("leaveMatchButton").innerText = "Leave Match";
               applyButton.classList.remove('hide');
                break;
        }

    }


    /**
     * Loads the match and stops physics updates while loading
     * @param {{player1: number, player2: number, matchId: number}} matchInfo
     * @return {Promise<void>}
     */
    async loadMatch(matchInfo){
        console.log("loading match...");
        this.#matchId = matchInfo['match_id'];
        this.matchmaking = false;
        this.dispatchEvent(this.createMatchmakingEvent());
        this.togglePhysicsUpdates();
        this.toggleTimer(true);
        this.viewManager.toggleHideBuildingPreviews();

        await loadingScreen.setText("retrieving Opponent info...");
        await loadingScreen.render();

        this.menuManager.exitMenu();
        this.friendsMenu.hideFriendsDisplay();
        this.spellCaster.dispatchVisibleSpellPreviewEvent(false);
        this.inMatch = true;
        this.spellCaster.multiplayer = true;
        //TODO: totally block input and don't allow recapture of pointerlock for the duration of this method


        //get opponent info (targetId, playerInfo, islandInfo) (via the REST API) and enter loading screen
        await this.peerInfo.retrieveInfo(matchInfo['player1'] === this.playerInfo.userID ? matchInfo['player2'] : matchInfo['player1'], false);
        await loadingScreen.setValue(50);
        await loadingScreen.setText("importing Opponent's island...");

        //synchronise coordinate system of 2 islands: lowest user id island is the main island which is set to (0,0,0).
        // the other island is rotated 180 degrees around the y-axis and translated from center of main island

        //construct 2nd player object and island object and add to world
        await this.worldManager.addImportedIslandToWorld(this.peerInfo.islandID, this.playerInfo.userID < this.peerInfo.userID);
        await loadingScreen.setValue(75);
        // console.log(this.playerInfo.userID < this.opponentInfo.userID ? "%cI am center" : "%cOpponent is center", "color: red; font-size: 20px; font-weight: bold;")
        const opponent = this.worldManager.addPeer({
            position: this.peerInfo.playerPosition,
            health: this.peerInfo.maxHealth,
            maxHealth: this.peerInfo.maxHealth,
            team: 1
        });
        opponent.setId({entity: {player_id: this.peerInfo.userID}});
        opponent.addEventListener("characterDied", this.updateEvents.get("playerDeath"));
        this.peerController = new Controller.PeerController({peer: opponent});
        this.characterController.addEventListener("eatingEvent", this.updateEvents.get("eatingEvent"));


        await loadingScreen.setText("creating proxys for buildings...");
        this.worldManager.generateProxys();
        await loadingScreen.setValue(80);

        await loadingScreen.setText("creating paths for minions...");
        //TODO: construct worldmap and instantiate minionSpawners
        this.minionController.worldMap = this.worldManager.world.islands;
        await loadingScreen.setValue(90);

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
            interval: 15
        });

        this.state = "inMatch";
        this.toggleLeaveMatchButton();
        //start sending state updates to server
        this.startSendingStateUpdates(this.peerInfo.userID);
        //announce to the server that the player is ready to start the match
        this.forwardingNameSpace.sendPlayerReadyEvent(this.#matchId);
    }

    /**
     * Starts the match and resumes physics updates
     */
    startMatch(){
        this.inMatch = true;
        this.friendsMenu.inMatch = true;
        loadingScreen.hide();
        this.togglePhysicsUpdates();
    }

    /**
     * Ends the match and shows the win/lose/draw screen (is called when the server sends the match end event)
     * @param data
     */
    async endMatch(data){
        document.getElementById('overlay').style.display = 'none'; //make sure the respawn overlay is hidden
        console.log(`match ended, winner: ${data.winner_id}`); //TODO: let backend also send won or lost gem ids
        this.stopSendingStateUpdates();
        this.result = "draw";

        //get staked gems and add new gems (if won)
        this.stakedGems = this.itemManager.getStakedGems();
        this.menuManager.unstakeGems();
        const newGemViews = this.itemManager.updateGems(await this.playerInfo.retrieveGems());
        this.menuManager.addItems(newGemViews);

        //update stats
        if(this.countStats){
            this.stats.set("gems_won", this.stats.get("gems_won") + newGemViews.length);
            this.stats.set("games_played", this.stats.get("games_played") + 1);
        }

        //fill params for results screen
        const renderGems = [];
        const currentStats = [];
        const lifetimeStats = [];

        if(data.winner_id === this.playerInfo.userID){
            //show win screen
            this.result = "win";
            for(const gem of this.stakedGems) {
                gem.staked = false;
            }
            newGemViews.forEach(gemView => {
                renderGems.push(gemView.item.getItemId());
            });
            if(this.countStats) this.stats.set("games_won", this.stats.get("games_won") + 1);
            console.log("you win");
        } else if (data.winner_id === this.peerInfo.userID){
            //show lose screen
            this.result = "lose";
            if(this.countStats) this.stats.set("gems_lost", this.stats.get("gems_lost") + this.stakedGems.length);
            this.stakedGems.forEach(gem => {
                renderGems.push(gem.getItemId());
            });
            console.log("you lose");
        } else {
            //show draw screen
            this.stakedGems.forEach(gem => {
                renderGems.push(gem.getItemId());
            });
            console.log("draw");
        }
        this.stats.forEach((value, key) => {
            currentStats.push({name: multiplayerStats.getDescription(key), value: value, key: key});
            switch (key) {
                case "player_kills":
                    this.playerInfo.changeXP(50*value);
                    //bonus
                    if(this.peerInfo.level > this.playerInfo.level) this.playerInfo.changeXP(50);
                    break
                case "minions_killed":
                    this.playerInfo.changeXP(10*value);
                    break;

            }
            this.lifetimeStats.set(key, this.lifetimeStats.get(key) + value);
        });
        this.lifetimeStats.forEach((value, key) => {
            lifetimeStats.push({name: multiplayerStats.getDescription(key), value: value, key: key});
        });
        //update lifetime stats
        await this.updateLifetimeStats();
        //reset current stats
        this.stats.forEach((value, key) => {
            this.stats.set(key, 0);
        });

        this.menuManager.renderMenu({
            name: "MultiplayerMenu",
            result: this.result,
            gemIds: renderGems,
            stats: {
                current: currentStats,
                lifetime: lifetimeStats
            }
        });
        this.worldManager.world.player.changeCurrentHealth(this.worldManager.world.player.maxHealth);
        this.worldManager.world.player.respawning = false;
        this.playerInfo.health = this.playerInfo.maxHealth;
        this.toggleLeaveMatchButton();
        //wait for player to click on close button
    }

    /**
     * retrieves the lifetime stats of the player from backend and updates the multiplayerStats object with it
     * @return {Promise<unknown>}
     */
    async #getLifetimeStats(){
        return new Promise((resolve, reject) => {
            const counter = 0;
            $.ajax({
                url: `${API_URL}/${playerStatsURI}?player_id=${this.playerInfo.userID}`,
                type: "GET",
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.error(e);
                    reject(e);
                }
            }).done((data, textStatus, jqXHR) => {
                console.log("GET lifetimeStats success");
                console.log(textStatus, data);
                delete data["player_id"];
                resolve(data);
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log("GET fail");
                console.log(textStatus, errorThrown);
                if(counter < postRetries){
                    console.log("retrying...");
                    this.#getLifetimeStats();
                } else {
                    reject(errorThrown);
                }
            });
        });
    }

    /**
     * updates the lifetime stats of the player in the backend
     * @return {Promise<unknown>}
     */
    async updateLifetimeStats(){
        let counter = 0;
        let data = {player_id: this.playerInfo.userID};
        this.lifetimeStats.forEach((value, key) => {
            data[key] = value;
        });
        return new Promise((resolve, reject)=> {
            $.ajax({
                url: `${API_URL}/${playerStatsURI}`,
                type: "PUT",
                data: JSON.stringify(data),
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.error(e);
                }
            }).done((data, textStatus, jqXHR) => {
                console.log("PUT success");
                console.log(textStatus, data);
                resolve(data);
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log("PUT fail");
                console.log(textStatus, errorThrown);
                if (counter < postRetries) {
                    console.log("retrying...");
                    counter++;
                    this.updateLifetimeStats();
                } else{
                    reject(errorThrown);
                }
            });
        });
    }

    /**
     * sets the game state back to single player
     */
    async unloadMatch(){
        console.log("leaving match");
        if(this.result === "lose"){
            for(const gem of this.stakedGems) {
                this.itemManager.deleteGem(gem);
                this.menuManager.removeItem(gem.getItemId());
            }
            this.stakedGems = [];
        }
        if(this.result === "win"){
            this.playerInfo.changeXP(300);
        }
        this.result = null;
        await loadingScreen.setValue(0);
        await loadingScreen.setText("leaving match...");
        await loadingScreen.render();
        this.togglePhysicsUpdates();

        this.spellCaster.multiplayer = false;
        //stop sending state updates to server & remove event listeners
        // this.stopSendingStateUpdates(); => moved to leaveMatch
        this.spellCaster.onSpellSwitch({detail: {spellSlot: this.worldManager.world.player.currentSpell++}}); //reset spellView TODO: does not work currently
        //remove island from world and remove spawners
        //!! important: remove reference to peer only after removing all event listeners !! (happens in stopSendingStateUpdates)
        this.peerController.peer = null;
        this.minionController.clearMinions();
        this.worldManager.resetWorldState(this.playerInfo.userID < this.peerInfo.userID);
        //stop receiving state updates from server
        this.toggleTimer(false);
        this.viewManager.toggleHideBuildingPreviews();
        this.inMatch = false;
        this.friendsMenu.inMatch = false;
        this.playerInfo.changeXP(200);
        this.togglePhysicsUpdates();
        this.state = "singlePlayer";
        this.toggleLeaveMatchButton();
        await loadingScreen.hide();
        console.log("done leaving match");
    }

    /**
     * sends a message to the server that the player is leaving the match, leaving friend's island or kicking a friend from their island
     */
    leaveMatch(){
        console.log(this.state);
        switch (this.state) {
            case "inMatch":
                if (confirm("Are you sure you want to leave the match?\nYou will lose your stakes!")) {
                    this.forwardingNameSpace.sendPlayerLeavingEvent(this.#matchId);
                }
                break;
            case "visited":
                this.removeFriendFromIsland();
                break;
            case "visiting":
                this.leaveFriendIsland();
                break;
            case "singlePlayer":
                console.log("leaveMatch called in singlePlayer state");
                break;
            default:
                console.error("leaveMatch called in wrong state");
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
        if(data.playerDeath) {
                this.showDeathOverlay();}
        if(data.playerRespawn){
                 this.peerController.peer.targettable = true;
                 this.viewManager.getPair(this.peerController.peer).view.show();
                 this.peerController.peer.health = this.peerController.peer.maxHealth;
            }
        if (data.eatingEvent) {
            const previousHealth = this.peerController.peer.health;
            this.peerController.peer.health += data.eatingEvent.params.health;
             this.peerController.peer.dispatchEvent(this.peerController.peer.createHealthUpdateEvent(previousHealth));
        }

        if(data.playerHealth){
            if(this.countStats) this.stats.set("damage_taken", this.stats.get("damage_taken") + data.playerHealth.previous - data.playerHealth.current);
            this.worldManager.world.player.takeDamage(data.playerHealth.previous - data.playerHealth.current);
        }
        if(data.spellEvent) {
            console.log(data.spellEvent)
            if(data.spellEvent.shieldUpdate){
                //get spell from id
                const shield = this.viewManager.getSpellEntityModelByID(data.spellEvent.shieldUpdate - 1000);
                if(shield) shield.takeDamage(10);
                else throw new Error("Shield not found");
            }
            else{
                data.spellEvent.type = spellTypes.getCtor(data.spellEvent.type);
            for (const property in data.spellEvent.params) {
                //assume that if a property has x, it has y and z as well (meaning data.spellEvent never contains properties with separate x, y, z values)
                if(data.spellEvent.params[property]?.x) data.spellEvent.params[property] = new THREE.Vector3(
                    data.spellEvent.params[property].x,
                    data.spellEvent.params[property].y,
                    data.spellEvent.params[property].z
                );
            }
            data.spellEvent.params.team = 1;
            data.spellEvent.params.playerID = this.peerInfo.userID;
            let spell = this.spellFactory.createSpell({detail: {...data.spellEvent, canDamage: false}});
            spell.setId(spell.id + 1000);
            if (data.spellEvent.type.name === "Shield") {
                if(spell) spell.addEventListener("shieldUpdate", this.updateEvents.get("shieldUpdate"));
                else throw new Error("Shield not found");
            }
            }


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
        this.forwardingNameSpace.sendTo(this.peerInfo.userID, {
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
        this.forwardingNameSpace.sendTo(this.peerInfo.userID, {
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
        this.forwardingNameSpace.sendTo(this.peerInfo.userID, {
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
        if(this.countStats) this.stats.set("damage_dealt", this.stats.get("damage_dealt") + event.detail.previous - event.detail.current);
        this.forwardingNameSpace.sendTo(this.peerInfo.userID, {
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
        this.forwardingNameSpace.sendTo(this.peerInfo.userID, {
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
        if(this.countStats) this.stats.set("damage_dealt", this.stats.get("damage_dealt") + event.detail.previous - event.detail.current);
        this.forwardingNameSpace.sendTo(this.peerInfo.userID, {
            playerHealth: event.detail
        });
    }

    /**
     * Send the eating event to the opponent
     */
    sendEatingEvent(event) {
        this.forwardingNameSpace.sendTo(this.peerInfo.userID, {
            eatingEvent: event.detail
        });
    }

    /**
     * removes event listeners from enemy minion
     * @param event
     */
    enemyDeathEvent(event){
        if(this.countStats) this.stats.set("minions_killed", this.stats.get("minions_killed") + 1);
        event.detail.model.removeEventListener("updatedHealth", this.updateEvents.get("minionHealthUpdate"));
        event.detail.model.removeEventListener("delete", this.updateEvents.get("minionDeath"));
    }

    /**
     * Send the player death event to the opponent (to notify the opponent that he has died)
     * @param event
     */
    sendPlayerDeathEvent(event){
        if(this.countStats) this.stats.set("player_kills", this.stats.get("player_kills") + 1);
        this.viewManager.getPair(this.peerController.peer).view.hide()
        this.peerController.peer.targettable = false;
        this.forwardingNameSpace.sendTo(this.peerInfo.userID, {
            playerDeath: event.detail
        });
    }
    /**
     * Send the player respawn event to the opponent (to notify the opponent that his enemy has respawned)
     * @param event
     */

    sendPlayerRespawnEvent(event){
        this.forwardingNameSpace.sendTo(this.peerInfo.userID, {
            playerRespawn: event.detail
        });
    }

    /**
     * Send the proxy health update to the opponent
     * @param event
     */
    sendProxyHealthUpdate(event){
        this.forwardingNameSpace.sendTo(this.peerInfo.userID, {
            proxy: {
                healthUpdate: event.detail
            }
        });
    }

    /**
     * send shield update to opponent
     */
    sendShieldUpdate(event){
        this.forwardingNameSpace.sendTo(this.peerInfo.userID, {
            spellEvent: {
                shieldUpdate: event.detail
            }
        });
    }

    /**
     * removes event listeners from proxy object
     * @param event
     */
    proxyDeathEvent(event){
        event.detail.model.removeEventListener("updateHealth", this.updateEvents.get("proxyHealthUpdate"));
        event.detail.model.removeEventListener("delete", this.updateEvents.get("proxyDeath"));
        if(event.detail.model.dbType === "altar_building" && event.detail.model.team !== 0){
            console.log("altar destroyed");
            this.forwardingNameSpace.sendAltarDestroyedEvent(this.#matchId);
        } else {
            console.log("a proxy destroyed");
        }
    }


    /**
     * function to show overlay when the player died
     */
    showDeathOverlay() {
        if (this.worldManager.world.player.respawning) return;
         if(this.countStats) this.stats.set("player_deaths", this.stats.get("player_deaths") + 1);
         this.worldManager.world.player.respawning = true;
         document.getElementById('overlay').style.display = 'flex';
        const timerElement = document.getElementById('timer');
        const respawnButton = document.getElementById('respawn-button');
        const textElement = document.getElementById('respawntext');
        let countdown = 10;  // Timer duration in seconds
        respawnButton.classList.remove('active');
        respawnButton.disabled = true;
        document.exitPointerLock();



        const timerInterval = setInterval(() => {
            countdown -= 1;
            timerElement.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(timerInterval);
                textElement.textContent = 'You can now respawn!';
                respawnButton.classList.add('active');
                respawnButton.disabled = false;
            }
        }, 1000);

        respawnButton.addEventListener('click', () => {
            if (!respawnButton.disabled) {
                document.getElementById('overlay').style.display = 'none';
                clearInterval(timerInterval);
                this.worldManager.world.player.respawn();
                this.sendPlayerRespawnEvent( {detail: {respawn: true}});
            }
        });
    }


    /**
     * Starts sending state updates to the server
     * @param {number} opponentId
     */
    startSendingStateUpdates(opponentId){
        this.peerController.peer.addEventListener("updateHealth", this.updateEvents.get("playerHealthUpdate"));
        //TODO: attach event listeners to all proxy objects (buildings) and send their health updates to the opponent
        this.worldManager.world.getProxys().forEach(proxy => {
            if(proxy.team === 0) return;
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
                    health: this.worldManager.world.player.health,
                    velocity: this.worldManager.world.player.velocity
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
        console.log("%cstopping state updates", "color: red; font-size: 20px; font-weight: bold;");
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

    /**
     * Processes the island visit event
     * @param {{request: "accept" | "reject" | "visit" | "leave" | "kick" | "cancel", sender: number}} data
     */
    async processIslandVisitEvent(data){
        console.log(`%cprocessing visit event... type: ${data.request}, sender: ${data.sender}`, "color: green; font-size: 20px; font-weight: bold;");
        switch (data.request) {
            case "accept": //your friend accepted your visit request
                //TODO: close & disable friendsMenu
                //reset visit request button
                this.friendsMenu.Friends.querySelector(`#friend-${this.pendingVisitRequest} > .View-Island`).innerText = "Visit Island";
                this.pendingVisitRequest = null;
                await this.loadFriendIsland(data.sender);
                break;
            case "reject": //your friend rejected your visit request
                this.#addFriendNotification(`${this.peerInfo.username} rejected your visit request`, data.request, data.sender);
                this.friendsMenu.Friends.querySelector(`#friend-${this.peerInfo.userID} > .View-Island`).innerText = "Visit Island";
                this.canMatchmake = true;
                this.pendingVisitRequest = null;
                break;
            case "kick": //your friend kicked you out of his/her island
                await this.unloadFriendIsland();
                break;
            case "leave": // your friend left your island or disconnects
                if(this.state === "visiting") {
                    await this.unloadFriendIsland();
                } else if(this.state === "visited") {
                    this.unloadFriend();
                } else {
                    throw new Error("wrong state");
                }
                break;
            case "visit": //your friend requested to visit your island
                //TODO: get friend name from friendslist
                this.#addFriendNotification(`'FriendName' requested to visit your island`, data.request, data.sender);
                break;
            case "cancel": //your friend cancelled his/her visit request
                //TODO: get friend name from friendslist
                this.#addFriendNotification(`'FriendName' cancelled his/her visit request`, data.request, data.sender)
                break;

        }
    }



    /**
     * callback for the visit island button of friendsmenu
     * @param {Event} event
     * @return {Promise<void>}
     */
    async #toggleVisitRequest(event) {
        if(event.target.classList.contains("View-Island")){
            let userId = event.target.parentNode.id;
            userId = parseInt(userId.substring(userId.indexOf("-") + 1));
            if(this.pendingVisitRequest === userId){ //cancel request
                this.cancelIslandVisitRequest();
                event.target.innerText = "Visit Island";
            } else if(this.pendingVisitRequest) { // send a different request + cancel the current one
                const friendElement = this.friendsMenu.Friends.querySelector(`#friend-${this.pendingVisitRequest}`);
                this.cancelIslandVisitRequest();
                friendElement.querySelector(".View-Island").innerText = "Visit Island";
                await this.requestIslandVisit(userId);
                event.target.innerText = "Cancel Request";
            } else { // send a request
                await this.requestIslandVisit(userId);
                event.target.innerText = "Cancel Request";
            }
        }
    }

    /**
     * Sends a request to the server to visit your friend's island
     */
    async requestIslandVisit(userId){
        await this.peerInfo.retrieveInfo(userId, false);
        this.canMatchmake = false;
        this.pendingVisitRequest = userId;
        this.forwardingNameSpace.sendIslandVisitEvent(userId, "visit");
    }

    /**
     * Cancels a request to the server to visit your friend's island
     */
    cancelIslandVisitRequest(){
        this.canMatchmake = true;
        this.pendingVisitRequest = null;
        this.forwardingNameSpace.sendIslandVisitEvent(this.peerInfo.userID, "cancel");
    }

    /**
     * accepts the visit request from your friend
     * @param userId - id of the user that sent the visit request
     */
    async acceptIslandVisit(userId){
        this.forwardingNameSpace.sendIslandVisitEvent(userId, "accept");
        this.canMatchmake = false;
        await this.loadFriend(userId);
    }

    /**
     * rejects the visit request from your friend
     * @param userId - id of the user that sent the visit request
     */
    rejectIslandVisit(userId) {
        this.forwardingNameSpace.sendIslandVisitEvent(userId, "reject");
    }

    /**
     * removes your friend from your island (kick him out)
     */
    removeFriendFromIsland(){
        this.forwardingNameSpace.sendIslandVisitEvent(this.peerInfo.userID, "kick");
        this.unloadFriend();
    }

    /**
     * leave your friend's island
     */
    leaveFriendIsland(){
        this.forwardingNameSpace.sendIslandVisitEvent(this.peerInfo.userID, "leave");
        this.unloadFriendIsland().then(() => {
            console.log("done leaving friend's island");
        });
    }

    /**
     * loads your friend's island (and unloads your own island)
     * @param {number} userId - id of the user that sent the visit request
     */
    async loadFriendIsland(userId){
        //TODO: remove own island and load friend's island
        console.log("loading friend's island...");
        this.togglePhysicsUpdates();
        this.viewManager.removeBuildingPreviews();
        const progressBar = document.getElementById('progress-bar');

        progressBar.labels[0].innerText = "teleporting friend to your island...";

        this.menuManager.exitMenu();
        this.spellCaster.dispatchVisibleSpellPreviewEvent(false);
        this.friendsMenu.inMatch = true;
        this.spellCaster.multiplayer = true;
        //TODO: totally block input and don't allow recapture of pointerlock for the duration of this method

        document.querySelector('.loading-animation').style.display = 'block';

        //get opponent info (targetId, playerInfo, islandInfo) (via the REST API) and enter loading screen
        await this.loadFriend(userId);
        progressBar.value = 50;

        progressBar.labels[0].innerText = `importing ${this.peerInfo.username}'s island...`;

        //synchronise coordinate system of 2 islands: lowest user id island is the main island which is set to (0,0,0).
        // the other island is rotated 180 degrees around the y-axis and translated from center of main island

        //construct 2nd player object and island object and add to world
        await this.worldManager.switchIslands(this.peerInfo.islandID);
        progressBar.value = 75;

        this.togglePhysicsUpdates();
        this.state = "visiting";
        this.toggleLeaveMatchButton();
        document.querySelector('.loading-animation').style.display = 'none';
    }

    /**
     * loads your friend on your island
     * @param {number} userId - id of the user that sent the visit request
     */
    async loadFriend(userId){
        //TODO: load friend on your island
        this.friendsMenu.hideFriendsDisplay();
        await this.peerInfo.retrieveInfo(userId, false);
        this.friendsMenu.inMatch = true;
        const friend = this.worldManager.addPeer({
            position: this.peerInfo.playerPosition,
            health: this.peerInfo.maxHealth,
            maxHealth: this.peerInfo.maxHealth,
            team: 1
        });
        friend.setId({entity: {player_id: this.peerInfo.userID}});
        this.peerController = new Controller.PeerController({peer: friend});
        this.state = "visited";
        this.toggleLeaveMatchButton();
        this.startSendingStateUpdates(this.peerInfo.userID);
    }

    /**
     * unloads your friend's island (and loads your own island)
     */
    async unloadFriendIsland(){
        console.log("leaving friends island");
        await loadingScreen.setValue(0);
        await loadingScreen.setText("leaving friend's island...");
        await loadingScreen.render();
        this.togglePhysicsUpdates();

        this.spellCaster.multiplayer = false;
        this.friendsMenu.inMatch = false;
        //stop sending state updates to server & remove event listeners
        // this.stopSendingStateUpdates(); => moved to leaveMatch
        this.spellCaster.onSpellSwitch({detail: {spellSlot: this.worldManager.world.player.currentSpell++}}); //reset spellView TODO: does not work currently

        this.unloadFriend();
        await loadingScreen.setValue(50);

        await this.worldManager.switchIslands(this.playerInfo.userID);
        await loadingScreen.setValue(100);
        this.togglePhysicsUpdates();
        console.log("done leaving match");
        this.canMatchmake = true;
        await loadingScreen.hide();
    }

    /**
     * removes your friend from your island
     */
    unloadFriend(){
        //!! important: remove reference to peer only after removing all event listeners !! (happens in stopSendingStateUpdates)
        this.stopSendingStateUpdates();
        this.worldManager.world.removeEntitiesByTeam(1);
        this.friendsMenu.inMatch = false;
        this.peerController.peer = null;
        this.state = "singlePlayer";
        this.toggleLeaveMatchButton();
        this.canMatchmake = true;
    }

    /**
     * adds a message to the mailbox
     * @param {string} message
     * @param {string} type - type of notification (visit, cancel, ...)
     * @param {number} userId - id of the user that sent the message
     */
    #addMessageToMailbox(message, type, userId){
        const notification = document.createElement("div");
        const notificationText = document.createElement("p");
        const notificationButtonsContainer = document.createElement("div");
        const acceptButton = document.createElement('button');
        const rejectButton = document.createElement('button');
        notificationText.innerText = message;
        notificationButtonsContainer.classList.add("request-buttons-container");
        acceptButton.classList.add('Accept-Request');
        rejectButton.classList.add('Reject-Request');
        notificationText.classList.add('request-text');
        notification.classList.add('request');

        notification.addEventListener("click", async (event) => {
            if(event.target.classList.contains("Accept-Request")){
                if(type === "visit") {
                    if(this.matchmaking) {
                        alertPopUp("cannot accept visit request while in matchmaking");
                        return;
                    }
                    await this.acceptIslandVisit(userId);
                }
            } else if(event.target.classList.contains("Reject-Request")){
                if(type === "visit") this.rejectIslandVisit(userId);
            } else{
                return;
            }
            this.#removeFriendNotification();
            notification.remove();
        });


        notification.appendChild(notificationText);
        notification.appendChild(notificationButtonsContainer);

        switch (type) {
            case "visit":
                notificationButtonsContainer.appendChild(acceptButton);
                notificationButtonsContainer.appendChild(rejectButton);
                break;
            case "cancel":
                notificationButtonsContainer.appendChild(rejectButton);
                break;
        }
        this.friendsMenu.Friends.querySelector("#listRequests").appendChild(notification);
    }

    /**
     * adds a notification to the notification bell and puts the message in your mailbox
     * @param {string} message
     * @param {string} type - type of notification (visit, cancel, ...)
     * @param {number} userId - id of the user that sent the message
     */
    #addFriendNotification(message, type, userId){
        const notificationCount = this.notificationContainer.querySelector(".notification-count");
        notificationCount.innerText = parseInt(notificationCount.innerText) + 1;
        this.#addMessageToMailbox(message, type, userId);
        this.notificationContainer.style.display = "block";
    }

    /**
     * callback to subtract a notification from the notification bell (and make it disappear if there are no notifications left)
     */
    #removeFriendNotification(){
        const notificationCount = this.notificationContainer.querySelector(".notification-count");
        const newCount = parseInt(notificationCount.innerText) - 1;
        if(newCount < 0) throw new Error("notification count cannot be negative");
        notificationCount.innerText = newCount;
        if(newCount === 0) this.notificationContainer.style.display = "none";
    }

}