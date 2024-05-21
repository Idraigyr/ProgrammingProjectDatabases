import {Entity} from "../Entity.js"
import * as THREE from "three";
import {convertWorldToGridPosition} from "../../../helpers.js";
import {gridCellSize} from "../../../configs/ViewConfigs.js";
import {popUp} from "../../../external/LevelUp.js";
import {API_URL, buildingUpgradeURI} from "../../../configs/EndpointConfigs.js";

/**
 * Base class for the placeable model
 */
export class Placeable extends Entity{
    #stats;
    #statMultipliers;
    constructor(params) {
        params.mass = 0;
        super(params);
        this.id = params?.id ?? null;
        this.level = params?.level ?? 0;
        this.maxLevel = 4;
        this.upgradable = false;
        this.rotation = params?.rotation ??  0;
        this.gemSlots = params?.gemSlots ?? 0;
        this.upgradeCost = params?.upgradeCost ?? 10;
        this.upgradeTime = params?.upgradeTime ?? 10;
        this.gems = [];
        this.#stats = new Map();
        //TODO: add stats
        this.#statMultipliers = new Map();
        this.inputCrystals = 0; // input for fusion
        //TODO: set stat multipliers (defaults to 1)
        this.ready = true;
        this.cellIndex = null;
        this.timeToBuild = 10; // in seconds
        this.changeLevel(0); // Set correct level stats
        // Force some things if they were passed in
        if(params.gemSlots !== undefined){
            this.gemSlots = params.gemSlots;
        }
        if(params.upgradeTime !== undefined){
            this.upgradeTime = params.upgradeTime;
        }
        if(params.upgradeCost !== undefined){
            this.upgradeCost = params.upgradeCost;
        }
    }

    /**
     * get the stats of the building (multipliers applied)
     * @return {Map}
     */
    getStats(){
        const stats = new Map();
        this.#stats.forEach((value, key) => {
            stats.set(key, this.#statMultipliers.get(key) ?? 1 * value);
        });
        return stats;
    }

    /**
     * add a stat to the building
     * @param {string} key
     * @param {number} value
     */
    addStat(key, value){
        this.#stats.set(key, value);
        this.#statMultipliers.set(key, 1);
    }

    /**
     * change stats of the building
     * @param {Map} stats
     */
    setStats(stats){
        stats.forEach((value, key) => {
            if(this.#stats.has(key)){
                this.#stats.set(key, value);
            } else {
                throw new Error("Invalid stat");
            }
        });
    }

    //TODO: do we want a separate class for managing stats and multipliers?

    /**
     * set the stat multipliers of the building
     * @param multipliers
     */
    addStatMultipliers(multipliers){
        multipliers.forEach((value, key) => {
            if(this.#statMultipliers.has(key)){
                const newValue = this.#statMultipliers.get(key) * value;
                this.#statMultipliers.set(key, newValue);
            } else {
                console.log("stat multiplier not applicable to building");
            }
        });
    }

    /**
     * remove stat multipliers from the building (by subtracting the value from the current value, but not below 1)
     * @param multipliers
     */
    removeStatMultipliers(multipliers){
        multipliers.forEach((value, key) => {
            if(this.#statMultipliers.has(key)){
                const newValue = this.#statMultipliers.get(key) / value;
                this.#statMultipliers.set(key, newValue >= 1 ? newValue : 1);
            } else {
                console.log("stat multiplier not applicable to building");
            }
        });
    }

    /**
     * adds a gem to the building
     * @param {Gem} gem
     */
    addGem(gem){
        if(this.gems.length === this.gemSlots) throw new Error("Building already has the maximum amount of gems");
        this.addStatMultipliers(gem.getAttributes());
        this.gems.push(gem.id);
    }

    /**
     * removes a gem from the building
     * @param {Gem} gem
     */
    removeGem(gem){
        if(!this.gems.includes(gem.id)) throw new Error("Building does not have the gem");
        this.removeStatMultipliers(gem.getAttributes());
        this.gems = this.gems.filter(gemId => {
            return gemId !== gem.id;
        });
    }

    /**
     * add 10 crystals to the input
     */
    addInputCrystals(){
        this.inputCrystals += 10;
    }

    /**
     * removes 10 from input crystals
     */
    removeInputCrystals(){
        this.inputCrystals -= 10;
    }

    /**
     * reset input crystals
     */
    resetInputCrystals(){
        this.inputCrystals = 0;
    }

    /**
     * set the id of the building according to the id in the database
     * @param data
     */
    setId(data){
       this.id = data.placeable_id;
    }

    /**
     * Formats the data for a POST request
     * @param playerInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} returns formatted data
     */
    formatPOSTData(playerInfo, islandPosition){ //TODO: add gems
        const gridPos = new THREE.Vector3().copy(this.position);
        gridPos.add(islandPosition);
        convertWorldToGridPosition(gridPos);
        const obj = {
            island_id: playerInfo.islandID,
            x: gridPos.x/gridCellSize,
            z: gridPos.z/gridCellSize,
            rotation: this.rotation/90,
            // type: this.dbType,
            level: this.level,
            // gems: []

        };
        for(const gem of this.gems){
            //obj.gems.push(gem.formatPOSTData(playerInfo));
        }
        return obj;
    }

    /**
     * Formats the data for a PUT request
     * @param playerInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} returns formatted data
     */
    formatPUTData(playerInfo, islandPosition){
       const obj = this.formatPOSTData(playerInfo, islandPosition);
       obj.placeable_id = this.id;
       return obj;
    }

    /**
     * Get the type of the building
     * @returns {string} the type of the building
     */
    get type(){
        return "building";
    }

    /**
     * Get the type of the building
     * @returns {string} the type of the building
     */
    get dbType(){
        return "placeable";
    }

    /**
     * Change the level of the building
     * @param amount {number} the amount to change the level by
     * @returns {boolean} if the level was changed
     */
    changeLevel(amount){
        let old = this.level;
        if(amount < 0 && Math.abs(amount) > this.level) return false;
        this.level = amount > 0 ? this.level + amount : Math.max(0, this.level + amount);
        if (this.level < 0 || this.level > 3){
            this.level = old;
            return false;
        }
        if(this.level === 0){
            this.upgradeTime = this.timeToBuild;
            this.upgradeCost = 0;
            this.gemSlots = 0;
        } else if(this.level === 1){
            this.upgradeTime = 10;
            this.upgradeCost = 500;
            this.gemSlots = 0;
        }else if(this.level === 2){
            this.upgradeTime = 300;
            this.upgradeCost = 3000;
            this.gemSlots = 1;
        }
        else if(this.level === 3){
            this.upgradeTime = 9000;
            this.upgradeCost = 10000;
            this.gemSlots = 2;
        } else if(this.level === 4){
            this.upgradeTime = Infinity;
            this.upgradeCost = Infinity;
            this.gemSlots = 3;
        }
        // this.dispatchEvent(this.createUpdateLevelEvent());
        // this.xpThreshold = this.increaseXpThreshold();
        return true;
    }
    /**
     * Create an event for updating the rotation
     * @param {number} degrees the rotation to update to
     * @fires {CustomEvent<{rotation: THREE.Quaternion}>} the event
     */
    rotate(degrees = 90){
        this.rotation += degrees;
        this.rotation = Math.round(this.rotation/90)*90;
        this.rotation %= 360;
        // Create quaternion from rotation
        let quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(0, this.rotation * Math.PI / 180, 0));
        this.dispatchEvent(new CustomEvent("updateRotation", {detail: {rotation: quaternion}}));
    }

    /**
     * Starts upgrade of the building
     */
    startUpgrade(){
        this.ready = false;
        this.dispatchEvent(new CustomEvent("startUpgrade", {detail: {time: this.upgradeTime, position: this.position}}));
        setTimeout(() => {
            this.ready = true;
            this.levelUp();
            this.dispatchEvent(new CustomEvent("finishUpgrade"));
        }, this.upgradeTime*1000);
    }
    levelUp(){
        this.changeLevel(1);
    }
}