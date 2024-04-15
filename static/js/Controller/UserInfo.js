// import * as $ from "jquery"
import {playerSpawn} from "../configs/ControllerConfigs.js";
import {API_URL, playerURI} from "../configs/EndpointConfigs.js";
import {Subject} from "../Patterns/Subject.js";
import {popUp} from "../external/LevelUp.js";

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
    async retrieveInfo(){
        try {
            // GET request to server
            const response = await $.getJSON(`${API_URL}/${playerURI}`);

            this.userID = response.entity.player_id;
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

    advertiseCurrentCondition(){
        this.crystals += 1000;
        this.dispatchEvent(this.createUpdateCrystalsEvent());
        this.dispatchEvent(this.createUpdateLevelEvent());
        this.dispatchEvent(this.createUpdateXpEvent());
        this.dispatchEvent(this.createUpdateXpTresholdEvent());
        this.dispatchEvent(this.createUpdateManaEvent());
        this.dispatchEvent(this.createUpdateHealthEvent());

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
        if(this.level === 0){
            return 50;
        } else if(this.level === 1){
            return 100;
        } else if(this.level === 2){
            return 200;
        } else if(this.level === 3){
            return 350;
        }
    }

    changeXP(amount){
        if(amount < 0 && Math.abs(amount) > this.experience) return false;
        if(amount + this.experience >= this.xpTreshold){
            this.changeLevel(0,true);
            this.experience = (this.experience + amount) - this.xpTreshold;
            this.xpTreshold = this.increaseXpTreshold();
        } else {
            this.experience = amount > 0 ? this.experience + amount : Math.max(0, this.experience + amount);
        }
        this.dispatchEvent(this.createUpdateXpEvent());
        return true;
    }

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
            this.dispatchEvent(this.createUpdateXpEvent());
        } else if(this.level === 3){
            this.maxMana = 400;
            this.dispatchEvent(this.createUpdateManaEvent());
            this.maxHealth = 400;
            this.dispatchEvent(this.createUpdateHealthEvent());
            this.maxGemAttribute = 6;
            this.maxBuildings = 8;
            this.unlockedBuildings = ["WarriorHut", "Mine","FusionTable", "Tree", "Bush", "Tower"];
            this.xpTreshold = 300;
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
            this.dispatchEvent(this.createUpdateXpEvent());
        }
        popUp(this.level, this.maxMana, this.maxHealth, this.maxGemAttribute, this.maxBuildings, this.unlockedBuildings);
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

    createUpdateManaEvent(){
        return new CustomEvent("updateManaBar", {detail: {current: this.mana, total: this.maxMana}});
    }

    createUpdateHealthEvent() {
        return new CustomEvent("updateHealthBar", {detail: {current: this.health, total: this.maxHealth}});
    }
}