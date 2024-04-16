// import * as $ from "jquery"
import {playerSpawn} from "../configs/ControllerConfigs.js";
import {API_URL, playerProfileURI, playerURI, timeURI} from "../configs/EndpointConfigs.js";
import {Subject} from "../Patterns/Subject.js";
import {popUp} from "../external/LevelUp.js";

/**
 * Class that holds the user information
 */
export class UserInfo extends Subject{
    constructor() {
        super();
        this.userID = null;
        this.islandID = null;
        this.unlockedBuildings = ["WarriorHut", "Mine","FusionTable", "Tree"];
        this.gems = [];
        this.spells = [];

        this.crystals = 100;

        this.maxMana = 50;
        this.maxHealth = 50;

        this.maxGemAttribute = 2;

        this.maxBuildings = 2;

        this.mana = 50;
        this.health = 100;

        this.level = 0;
        this.experience = 0;
        this.xpTreshold = 50;
        this.buildingsPlaced = 0;

        this.playerPosition = {
            x: 0,
            y: 0,
            z: 0
        }
    }

    /**
     * Retrieves the user information from the server
     * @returns {Promise<void>} - Promise that resolves when the user information is retrieved
     */
    async retrieveInfo(){
        try {
            // GET request to server
            const response = await $.getJSON(`${API_URL}/${playerURI}`);
            const response2 = await $.getJSON(`${API_URL}/${playerProfileURI}`);

            this.userID = response.entity.player_id;
            this.username = response2.username;


            this.islandID = response.entity.island_id;
            this.unclockedBuildings = response.blueprints;
            this.gems = response.gems;

            this.crystals = response.crystals;

            this.gems = response.gems;

            // this.level = response?.entity?.level;
            this.experience = response.xp
            // this.mana = response?.mana // TODO @Flynn ?
            this.mana += this.calculateManaBonus();
            this.health += this.calculateHealthBonus();

            this.playerPosition.x = response?.entity?.x ?? playerSpawn.x;
            this.playerPosition.y = response?.entity?.y ?? playerSpawn.y;
            this.playerPosition.z = response?.entity?.z ?? playerSpawn.z;



            this.advertiseCurrentCondition();

        } catch (err){
            console.error(err);
        }
    }

    /**
     * Retrieves the current time from the server
     * @returns {Promise<*>} - Promise that resolves with the current time
     */
    async getCurrentTime(){
        try {
            // GET request to server
            const response = await $.getJSON(`${API_URL}/${timeURI}`);
            console.log(response.time);
            return response.time;
        } catch (err){
            console.error(err);
        }

    }

    /**
     * Updates the user information on the server and frontend
     */
    advertiseCurrentCondition(){
        // TODO: do you need to call updateUserInfoBackend() here?
        this.dispatchEvent(this.createUpdateCrystalsEvent());
        this.dispatchEvent(this.createUpdateLevelEvent());
        this.dispatchEvent(this.createUpdateXpEvent());
        this.dispatchEvent(this.createUpdateXpTresholdEvent());
        this.dispatchEvent(this.createUpdateManaEvent());
        this.dispatchEvent(this.createUpdateHealthEvent());
        this.dispatchEvent(this.createUpdateUsernameEvent());
        this.updateUserInfoBackend();
    }

    /**
     * Calculates the health bonus based on the level
     * @returns {number} - Health bonus
     */
    calculateHealthBonus(){
        return this.level*10;
    }

    /**
     * Calculates the mana bonus based on the level
     * @returns {number} - Mana bonus
     */
    calculateManaBonus(){
        return this.level*10;
    }

    /**
     * Changes the amount of crystals
     * @param amount - Amount of crystals to change
     * @returns {boolean} - True if the crystals were changed, false otherwise
     */
    changeCrystals(amount){
        if(amount < 0 && Math.abs(amount) > this.crystals) return false;
        this.crystals = amount > 0 ? this.crystals + amount : Math.max(0, this.crystals + amount);
        this.dispatchEvent(this.createUpdateCrystalsEvent());
        // Send put request to server to update the crystals
        this.updateUserInfoBackend();
        return true;
    }

    /**
     * Updates the user information on the server
     */
    updateUserInfoBackend(){
        try {
            // PUT request to server
            // TODO: add info about gems
            $.ajax({
                url: `${API_URL}/${playerURI}`,
                type: 'PUT',
                data: JSON.stringify({
                    user_profile_id: this.userID,
                    crystals: this.crystals,
                    /// xp: this.experience, // TODO: add it back
                    mana: this.mana,
                    entity: {
                        // x: this.playerPosition.x,
                        // y: this.playerPosition.y,
                        // z: this.playerPosition.z,
                        level: this.level
                    }
                }),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                async: false,
                error: (e) => {
                    console.error(e);
                }
            });
        } catch (err){
            console.error(err);
        }
    }

    /**
     * Increases the experience threshold based on the level
     * @returns {number} - New experience threshold
     */
    increaseXpTreshold(){
        this.dispatchEvent(this.createUpdateXpTresholdEvent());
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
        this.updateUserInfoBackend();
    }

    /**
     * Changes the amount of experience
     * @param amount - Amount of experience to add
     * @returns {boolean} - True if the experience was changed, false otherwise
     */
    changeXP(amount){
        if(amount < 0 && Math.abs(amount) > this.experience) return false;
        if(amount + this.experience >= this.xpTreshold){
            var oldThreshold = this.xpTreshold
            this.changeLevel(0,true);
            this.experience = (this.experience + amount) - oldThreshold;
        } else {
            this.experience = amount > 0 ? this.experience + amount : Math.max(0, this.experience + amount);
        }
        this.dispatchEvent(this.createUpdateXpEvent());
        this.updateUserInfoBackend();
        return true;
    }

    /**
     * Increases the level of the player
     * @param amount - Level to set
     * @param increase - True if the level should be increased, false if it should be set to 0
     * @returns {boolean} - True if the level was changed, false otherwise
     */
    changeLevel(amount=0, increase=false){
        if(amount === 0){
            if(increase){
                let old = this.level;
                this.level = this.level + 1;
                if (this.level < 0 || this.level > 4){
                    this.level = old;
                    return false;
                }
            } else{
                this.level = 0;
            }
        } else{
            if(amount < 0 && Math.abs(amount) > this.level) return false;
            if(amount < 0 || amount > 4) return false;
            this.level = amount;
        }
        this.dispatchEvent(this.createUpdateLevelEvent());
        if(this.level === 0){
            this.maxMana = 50;
            this.dispatchEvent(this.createUpdateManaEvent());
            this.maxHealth = 50;
            this.dispatchEvent(this.createUpdateHealthEvent());
            this.maxGemAttribute = 1;
            this.maxBuildings = 2;
            this.unlockedBuildings = ["WarriorHut", "Mine","FusionTable", "Tree"];
            this.xpTreshold = 50;
            this.dispatchEvent(this.createUpdateXpEvent());
            this.dispatchEvent(this.createUpdateXpTresholdEvent());
        }else if(this.level === 1){
            this.maxMana = 100;
            this.dispatchEvent(this.createUpdateManaEvent());
            this.maxHealth = 100;
            this.dispatchEvent(this.createUpdateHealthEvent());
            this.maxGemAttribute = 2;
            this.maxBuildings = 4;
            this.unlockedBuildings = ["WarriorHut", "Mine","FusionTable", "Tree", "Bush", "Tower"];
            this.xpTreshold = 100;
            this.dispatchEvent(this.createUpdateXpEvent());
            this.dispatchEvent(this.createUpdateXpTresholdEvent());

        }
        else if(this.level === 2){
            this.maxMana = 200;
            this.dispatchEvent(this.createUpdateManaEvent());
            this.maxHealth = 200;
            this.dispatchEvent(this.createUpdateHealthEvent());
            this.maxGemAttribute = 4;
            this.maxBuildings = 6;
            this.unlockedBuildings = ["WarriorHut", "Mine","FusionTable", "Tree", "Bush", "Tower"];
            this.xpTreshold = 200;
            this.dispatchEvent(this.createUpdateXpTresholdEvent());
            this.dispatchEvent(this.createUpdateXpEvent());
        } else if(this.level === 3){
            this.maxMana = 400;
            this.dispatchEvent(this.createUpdateManaEvent());
            this.maxHealth = 400;
            this.dispatchEvent(this.createUpdateHealthEvent());
            this.maxGemAttribute = 6;
            this.maxBuildings = 8;
            this.unlockedBuildings = ["WarriorHut", "Mine","FusionTable", "Tree", "Bush", "Tower"];
            this.xpTreshold = 350;
            this.dispatchEvent(this.createUpdateXpTresholdEvent());
            this.dispatchEvent(this.createUpdateXpEvent());
        } else if(this.level === 4){
            this.maxMana = 600;
            this.dispatchEvent(this.createUpdateManaEvent());
            this.maxHealth = 600;
            this.dispatchEvent(this.createUpdateHealthEvent());
            this.maxGemAttribute = 8;
            this.maxBuildings = 10;
            this.unlockedBuildings = ["WarriorHut", "Mine","FusionTable", "Tree", "Bush", "Tower"];
            this.xpTreshold = 100000;
            this.dispatchEvent(this.createUpdateXpTresholdEvent());
            this.dispatchEvent(this.createUpdateXpEvent());
        }
        popUp(this.level, this.maxMana, this.maxHealth, this.maxGemAttribute, this.maxBuildings, this.unlockedBuildings);
        this.updateUserInfoBackend();
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
    createUpdateXpTresholdEvent() {
        console.log(this.xpTreshold)
        return new CustomEvent("updateXpTreshold", {detail: {xp: this.experience, threshold: this.xpTreshold}});
    }

    /**
     * Create event to change level of the player
     * @returns {CustomEvent<{level: number}>} - Event that contains the new level
     */
    createUpdateLevelEvent() {
        // this.updateUserInfoBackend(); // TODO: why do this line is not working properly?
        return new CustomEvent("updateLevel", {detail: {level: this.level}});
    }

    /**
     * Create event to change the amount of xp
     * @returns {CustomEvent<{xp: number, threshold: number}>} - Event that contains the new amount of xp
     */
    createUpdateXpEvent() {
        return new CustomEvent("updateXp", {detail: {xp: this.experience, threshold: this.xpTreshold}});
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