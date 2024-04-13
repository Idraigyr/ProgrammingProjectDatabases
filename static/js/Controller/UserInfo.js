// import * as $ from "jquery"
import {playerSpawn} from "../configs/ControllerConfigs.js";
import {API_URL, playerURI} from "../configs/EndpointConfigs.js";
import {Subject} from "../Patterns/Subject.js";
export class UserInfo extends Subject{
    constructor() {
        super();
        this.userID = null;
        this.islandID = null;
        this.unclockedBuildings = [];
        this.gems = [];
        this.spells = [];

        this.crystals = 100;

        this.mana = 1000;
        this.health = 100;

        this.level = 0;
        this.experience = 0;
        this.xpTreshold = 100;

        this.playerPosition = {
            x: 0,
            y: 0,
            z: 0
        }
    }
    async retrieveInfo(){
        try {
            // GET request to server
            const response = await $.getJSON(`${API_URL}/${playerURI}`);

            this.userID = response.entity.player_id;
            this.islandID = response.entity.island_id;
            this.unclockedBuildings = response.blueprints;

            this.crystals = response.crystals;

            this.level = response?.entity?.level;
            this.experience = response.xp
            // this.mana = response?.mana // TODO @Flynn ?
            this.mana += this.calculateManaBonus();
            this.health += this.calculateHealthBonus();

            this.playerPosition.x = response?.entity?.x ?? playerSpawn.x;
            this.playerPosition.y = response?.entity?.y ?? playerSpawn.y;
            this.playerPosition.z = response?.entity?.z ?? playerSpawn.z;

            this.advertiseCurrentCondition();

        } catch (err){
            console.log(err);
        }
    }

    advertiseCurrentCondition(){
        this.crystals += 1000;
        this.dispatchEvent(this.createUpdateCrystalsEvent());
        this.dispatchEvent(this.createUpdateLevelEvent());
        this.dispatchEvent(this.createUpdateXpEvent());
        this.dispatchEvent(this.createUpdateXpTresholdEvent());
    }

    calculateHealthBonus(){
        return this.level*10;
    }

    calculateManaBonus(){
        return this.level*10;
    }

    changeCrystals(amount){
        if(amount < 0 && Math.abs(amount) > this.crystals) return false;
        this.crystals = amount > 0 ? this.crystals + amount : Math.max(0, this.crystals + amount);
        this.dispatchEvent(this.createUpdateCrystalsEvent());
        return true;
    }

    increaseXpTreshold(){
        this.dispatchEvent(this.createUpdateXpTresholdEvent());
        return this.level * 100;
    }

    changeXP(amount){
        if(amount < 0 && Math.abs(amount) > this.experience) return false;
        if(amount + this.experience >= this.xpTreshold){
            this.changeLevel(1);
            this.experience = (this.experience + amount) - this.xpTreshold;
            this.xpTreshold = this.increaseXpTreshold();
        } else {
            this.experience = amount > 0 ? this.experience + amount : Math.max(0, this.experience + amount);
        }
        this.dispatchEvent(this.createUpdateXpEvent());
        return true;
    }

    changeLevel(amount){
        if(amount < 0 && Math.abs(amount) > this.level) return false;
        this.level = amount > 0 ? this.level + amount : Math.max(0, this.level + amount);
        this.dispatchEvent(this.createUpdateLevelEvent());
        return true;
    }

    createUpdateCrystalsEvent() {
        return new CustomEvent("updateCrystals", {detail: {crystals: this.crystals}});
    }

    createUpdateXpTresholdEvent() {
        return new CustomEvent("updateXpTreshold", {detail: {crystals: this.crystals}});
    }

    createUpdateLevelEvent() {
        return new CustomEvent("updateLevel", {detail: {level: this.level}});
    }

    createUpdateXpEvent() {
        return new CustomEvent("updateXp", {detail: {xp: this.experience, threshold: this.xpTreshold}});
    }
}