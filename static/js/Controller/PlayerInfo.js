// import * as $ from "jquery"
import {playerSpawn} from "../configs/ControllerConfigs.js";
import {
    API_URL,
    playerProfileURI,
    playerURI,
    timeURI,
    logoutURI,
    islandURI,
    buildingUpgradeURI
} from "../configs/EndpointConfigs.js";
import {Subject} from "../Patterns/Subject.js";
import {popUp} from "../external/LevelUp.js";
import {assert} from "../helpers.js";
import {Level} from "../configs/LevelConfigs.js";
import {Vector3} from "three";

/**
 * Class that holds the user information
 */
export class PlayerInfo extends Subject{
    constructor() {
        super();
        this.userID = null;
        this.islandID = null;
        this.gems = [];
        this.spells = [];

        this.crystals = 100;

        this.mana = 50;
        this.maxMana = 50;
        this.maxHealth = 100;
        this.health = 100;

        this.maxGemAttribute = 2;

        this.maxBuildings = 2;

        this.level = 1;
        this.experience = 0;
        this.xpThreshold = 50;

        this.playerPosition = new Vector3(0, 0, 0);

        this.buildingsThreshold = {
            Tree: Level[this.level]["Tree"],
            Bush: Level[this.level]["Bush"],
            Wall: Level[this.level]["Wall"],
            Tower: Level[this.level]["Tower"],
            WarriorHut: Level[this.level]["WarriorHut"],
            Mine: Level[this.level]["Mine"],
            FusionTable: Level[this.level]["FusionTable"],
        };
        this.buildingsPlaced = {Tree: 0, Bush: 0, Wall: 0, Tower: 0, WarriorHut: 0, Mine: 0, FusionTable: 0};

    }

    async logout(){
        // Get current time
        const currentTime = await this.getCurrentTime();
        try {
            $.ajax({
                url: `${API_URL}/${playerURI}`,
                type: 'PUT',
                data: JSON.stringify({
                    user_profile_id: this.userID,
                    last_logout: currentTime,
                    entity: {
                        x: Math.round(this.playerPosition.x),
                        y: Math.round(this.playerPosition.y + 20), // To prevent the player from spawning in the ground
                        z: Math.round(this.playerPosition.z)
                    },
                    spells: this.spells
                }),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                error: (e) => {
                    console.error(e);
                }
            });
        } catch (err){
            console.error(err);
        }
    }

    async login(){
        // Get current time
        const currentTime = await this.getCurrentTime();
        try {
            $.ajax({
                url: `${API_URL}/${playerURI}`,
                type: 'PUT',
                data: JSON.stringify({
                    user_profile_id: this.userID,
                    last_login: currentTime
                }),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                error: (e) => {
                    console.error(e);
                }
            });
        } catch (err){
            console.error(err);
        }
    }

    /**
     * Updates the equipped spells of the player
     * @param event
     */
    updateSpells(event){
        for(const spell of event.detail.spells){
            this.spells.find(s => s.spell_id === spell.id).slot = spell.slot;
        }
        $.ajax({
            url: `${API_URL}/${playerURI}`,
            type: 'PUT',
            data: JSON.stringify({
                user_profile_id: this.userID,
                spells: this.spells
            }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            error: (e) => {
                console.error(e);
            }
        });
    }

    /**
     * Retrieves the user information from the server
     * @param {number | null} playerId - optional, The id of the player to retrieve the information from
     * @param {boolean} propagate - optional, Whether to propagate the information across the frontend (set to false when retrieving info that is not for the current player)
     * @returns {Promise<void>} - Promise that resolves when the user information is retrieved
     */
    async retrieveInfo(playerId=null, propagate=true){
        try {
            // GET request to server
            const response = await $.getJSON(`${API_URL}/${playerURI}${playerId ? `?id=${playerId}` : ''}`);

            this.userID = response.entity.player_id;
            this.username = response.username;

            this.spells = response.spells;

            this.islandID = response.entity.island_id;
            this.gems = response.gems;
            this.crystals = response.crystals;

            this.gems = response.gems;

            this.level = response?.entity?.level;
            this.experience = response.xp
            this.mana = response?.mana
            // this.mana += this.calculateManaBonus();
            this.health += this.calculateHealthBonus();

            this.playerPosition.x = response?.entity?.x ?? playerSpawn.x;
            this.playerPosition.y = response?.entity?.y ?? playerSpawn.y;
            this.playerPosition.z = response?.entity?.z ?? playerSpawn.z;

            this.xpThreshold = this.increaseXpThreshold();

            const responseBuildings = await $.getJSON(`${API_URL}/${islandURI}?id=${this.islandID}`);
            for(const building of responseBuildings.placeables){
                if(building.blueprint.name in this.buildingsPlaced){
                    this.buildingsPlaced[building.blueprint.name]++;
                }
            }

            if(!propagate) return;
            this.setLevelStats();
            this.advertiseCurrentCondition();

        } catch (err){
            console.error(err);
        }
    }

    /**
     * Retrieves user info from the server and filters out the gems
     * the retrieveInfo method needs to have been called at least once before this method (to get userID)
     * @return {Promise<Object[]>} - returns a promise that resolves with the gems array
     */
    async retrieveGems(){
        assert(this.userID, "playerInfo.retrieveGems: userID is not defined");
        try {
            // GET request to server
            const response = await $.getJSON(`${API_URL}/${playerURI}?id=${this.userID}`);
            return response.gems;
        } catch (err){
            console.error(err);
        }
        return null;
    }

    /**
     * Retrieves the current time from the server
     * @returns {Promise<*>} - Promise that resolves with the current time
     */
    async getCurrentTime(){
        try {
            // GET request to server
            const response = await $.getJSON(`${API_URL}/${timeURI}`);
            return response.time;
        } catch (err){
            console.error(err);
        }

    }

    /**
     * Updates the user information on the server and frontend
     */
    advertiseCurrentCondition(){
        this.dispatchEvent(this.createUpdateCrystalsEvent());
        this.dispatchEvent(this.createUpdateLevelEvent());
        this.dispatchEvent(this.createUpdateXpEvent());
        this.dispatchEvent(this.createUpdateXpThresholdEvent());
        this.dispatchEvent(this.createUpdateManaEvent());
        this.dispatchEvent(this.createUpdateHealthEvent());
        this.dispatchEvent(this.createUpdateUsernameEvent());
        this.updatePlayerInfoBackend();
    }

    /**
     * Calculates the health bonus based on the level
     * @returns {number} - Health bonus
     */
    calculateHealthBonus(){
        return Math.min(0, this.level <= 10 ? (this.level-1)*20 : 180 + (this.level-10)*10);
    }

    isPlayerLoggedIn(){
        return this.userID !== null;
    }

    /**
     * Calculates the mana bonus based on the level
     * @returns {number} - Mana bonus
     */
    calculateManaBonus(){
        return Math.min(0, this.level <= 10 ? (this.level-1)*20 : 180 + (this.level-10)*10);
    }

    /**
     * Changes the amount of crystals
     * @param amount - Amount of crystals to change
     * @returns {boolean} - True if the crystals were changed, false otherwise
     */
    changeCrystals(amount){
        if(!Number.isFinite(amount)) throw new Error("playerInfo.changeCrystals: amount is not defined");
        if(amount < 0 && Math.abs(amount) > this.crystals) return false;
        this.crystals = amount > 0 ? this.crystals + amount : Math.max(0, this.crystals + amount);
        this.dispatchEvent(this.createUpdateCrystalsEvent());
        // Send put request to server to update the crystals
        this.updatePlayerInfoBackend();
        return true;
    }

    getCrystals(){
        return this.crystals;
    }

    updateMana(event){
        this.mana = event.detail.current;
        this.maxMana = event.detail.total;
        this.dispatchEvent(this.createUpdateManaEvent());
        this.updatePlayerInfoBackend();
    }

    updatePlayerPosition(event){
        this.playerPosition = event.detail.position;
    }

    /**
     * Updates the player information on the server
     */
    updatePlayerInfoBackend(){
        try {
            // PUT request to server
            // TODO: add info about gems
            $.ajax({
                url: `${API_URL}/${playerURI}`,
                type: 'PUT',
                data: JSON.stringify({
                    user_profile_id: this.userID,
                    crystals: this.crystals,
                    xp: this.experience,
                    mana: this.mana,
                    entity: {
                        x: Math.round(this.playerPosition.x),
                        y: Math.round(this.playerPosition.y),
                        z: Math.round(this.playerPosition.z),
                        level: this.level
                    },
                    spells: this.spells
                }),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                error: (e) => {
                    console.error(e);
                    console.error("MAna: ", this.mana);
                }
            });
        } catch (err){
            console.error(err);
        }
    }
    /**
     * Creates level up task on the server
     * @param building - Building to level up
     */
    async createLevelUpTask(building){ //TODO: WHY DO THIS HERE?
        // Get time
        let response = await this.getCurrentTime();
        let serverTime = new Date(response);
        serverTime.setSeconds(serverTime.getSeconds()+ building.upgradeTime);
        let timeZoneOffset = serverTime.getTimezoneOffset() * 60000;
        let localTime = new Date(serverTime.getTime() - timeZoneOffset);
        // Convert local time to ISO string
        let time = localTime.toISOString();
        let formattedDate = time.slice(0, 19);
        try{
            await $.ajax({
                url: `${API_URL}/${buildingUpgradeURI}`,
                type: "POST",
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                    island_id: this.islandID,
                    to_level: building.level + 1,
                    building_id: building.id,
                    used_crystals: building.upgradeCost,
                    endtime: formattedDate
                }),
                success: (data) => {
                    console.log(data);
                },
                error: (err) => {
                    console.log(err);
                }
            });
        } catch (e){
            console.log(e);
        }
    }
    changeHealth(amount) {
        this.health = amount
        this.dispatchEvent(this.createUpdateHealthEvent());
    }
    /**
     * Increases the experience threshold based on the level
     * @returns {number} - New experience threshold
     */
    increaseXpThreshold(){
        this.dispatchEvent(this.createUpdateXpThresholdEvent());
        if(this.level === 0){
            return 50;
        } else if(this.level === 1){
            return 100;
        } else if(this.level === 2){
            return 200;
        } else if(this.level === 3){
            return 350;
        } else if(this.level === 4){
            return 100000;
        }
    }

    /**
     * Relaods the world and sets the player position to the spawn position
     */
    reload(){
        this.playerPosition.x = playerSpawn.x;
        this.playerPosition.y = playerSpawn.y;
        this.playerPosition.z = playerSpawn.z;
        console.log("Player respawned on ", this.playerPosition);
        this.advertiseCurrentCondition();
        location.reload();
    }
    /**
     * Changes the amount of experience
     * @param amount - Amount of experience to add
     * @returns {boolean} - True if the experience was changed, false otherwise
     */
    changeXP(amount){
        if(!amount) throw new Error("playerInfo.changeXP: amount is not defined");
        if(amount < 0 && Math.abs(amount) > this.experience) return false;
        if(amount + this.experience >= this.xpThreshold){
            var oldThreshold = this.xpThreshold
            this.changeLevel(0,true);
            this.experience = (this.experience + amount) - oldThreshold;
        } else {
            this.experience = amount > 0 ? this.experience + amount : Math.max(0, this.experience + amount);
        }
        this.dispatchEvent(this.createUpdateXpEvent());
        this.dispatchEvent(this.createUpdateXpThresholdEvent());
        this.updatePlayerInfoBackend();
        return true;
    }
    // TODO: rewrite this to have a map of levels and their respective values
    setLevelStats(){
        if(this.level){
            this.maxMana = Level[this.level]["maxMana"];
            this.maxHealth = Level[this.level]["maxHealth"];
            this.maxGemAttribute = Level[this.level]["maxGemAttribute"];
            this.xpThreshold = Level[this.level]["xpThreshold"];
            this.buildingsThreshold["Tree"] = Level[this.level]["Tree"];
            this.buildingsThreshold["Bush"] = Level[this.level]["Bush"];
            this.buildingsThreshold["Wall"] = Level[this.level]["Wall"];
            this.buildingsThreshold["Tower"] = Level[this.level]["Tower"];
            this.buildingsThreshold["WarriorHut"] = Level[this.level]["WarriorHut"];
            this.buildingsThreshold["Mine"] = Level[this.level]["Mine"];
            this.buildingsThreshold["FusionTable"] = Level[this.level]["FusionTable"];
            this.dispatchEvent(this.createUpdateManaEvent());
            this.dispatchEvent(this.createUpdateHealthEvent());
            this.dispatchEvent(this.createUpdateXpEvent());
            this.dispatchEvent(this.createUpdateXpThresholdEvent());
            this.dispatchEvent(new CustomEvent("updateMaxManaAndHealth", {detail: {maxMana: this.maxMana, maxHealth: this.maxHealth}}));

        }
    }
    /**
     * Increases the level of the player
     * @param amount - Level to set
     * @param increase - True if the level should be increased, false if it should be set to 0
     * @returns {boolean} - True if the level was changed, false otherwise
     */
    changeLevel(amount=0, increase=false){ //TODO: refactor this, increase is obsolete, just use amount
        if(amount === 0){
            if(increase){
                let old = this.level;
                this.level = this.level + 1;
                if (this.level < 0 || this.level > 15){
                    this.level = old;
                    return false;
                }
            } else{
                this.level = 0;
            }
        } else{
            if(amount < 0 && Math.abs(amount) > this.level) return false;
            if(amount < 0 || amount > 15) return false;
            this.level = amount;
        }
        this.dispatchEvent(this.createUpdateLevelEvent());
        this.setLevelStats();
        popUp(this.level, this.maxMana, this.maxHealth, this.maxGemAttribute);
        this.updatePlayerInfoBackend();
        return true;
    }

    /**
     * Changes the amount of mana
     * @returns {CustomEvent<{crystals: number}>} - Event that contains the new amount of mana
     */
    createUpdateCrystalsEvent() {
        return new CustomEvent("updateCrystals", {detail: {crystals: this.crystals}});
    }

    /**
     * Changes the amount of xp threshold
     * @returns {CustomEvent<{xp: number, threshold: number}>} - Event that contains the new amount of xp threshold
     */
    createUpdateXpThresholdEvent() {
        return new CustomEvent("updateXpThreshold", {detail: {xp: this.experience, threshold: this.xpThreshold}});
    }

    /**
     * Create event to change level of the player
     * @returns {CustomEvent<{level: number}>} - Event that contains the new level
     */
    createUpdateLevelEvent() {
        // this.updatePlayerInfoBackend(); // TODO: why do this line is not working properly?
        return new CustomEvent("updateLevel", {detail: {level: this.level}});
    }

    /**
     * Create event to change the amount of xp
     * @returns {CustomEvent<{xp: number, threshold: number}>} - Event that contains the new amount of xp
     */
    createUpdateXpEvent() {
        return new CustomEvent("updateXp", {detail: {xp: this.experience, threshold: this.xpThreshold}});
    }

    /**
     * Create event to change the amount of mana
     * @returns {CustomEvent<{current: number, total: number}>}
     */
    createUpdateManaEvent(){
        return new CustomEvent("updateManaBar", {detail: {current: this.mana, total: this.maxMana}});
    }

    /**
     * Create event to change the amount of health
     * @returns {CustomEvent<{current: number, total: number}>} - Event that contains the new amount of health
     */
    createUpdateHealthEvent() {
        return new CustomEvent("updateHealthBar", {detail: {current: this.health, total: this.maxHealth}});
    }

    /**
     * Create event to change the username
     * @returns {CustomEvent<{username}>} - Event that contains the new username
     */
    createUpdateUsernameEvent() {
        return new CustomEvent("updateUsername", {detail: {username: this.username}});
    }
}