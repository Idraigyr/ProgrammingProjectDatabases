import {Entity} from "../Entity.js"
import * as THREE from "three";
import {convertWorldToGridPosition} from "../../../helpers.js";
import {gridCellSize} from "../../../configs/ViewConfigs.js";
import {popUp} from "../../../external/LevelUp.js";

/**
 * Base class for the placeable model
 */
export class Placeable extends Entity{
    constructor(params) {
        super(params);
        this.id = params?.id ?? null;
        this.level = params?.level ?? 0;
        this.rotation = params?.rotation ??  0;
        this.gemSlots = params?.gemSlots ?? 0;
        this.levelUpTime = params?.levelUpTime ?? 0;
        this.gems = [];
        this.ready = true;
        this.cellIndex = null;
        this.timeToBuild = 10; // in seconds
    }

    /**
     * adds a gem to the building
     * @param gemId
     */
    addGem(gemId){
        if(this.gems.length === this.gemSlots) throw new Error("Building already has the maximum amount of gems");
        this.gems.push(gemId);
    }

    /**
     * removes a gem from the building
     * @param gemId
     */
    removeGem(gemId){
        if(!this.gems.includes(gemId)) throw new Error("Building does not have the gem");
        this.gems = this.gems.filter(gem => gem !== gemId);
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
        console.log(this.rotation/90);
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
        if (this.level < 0 || this.level > 4){
            this.level = old;
            return false;
        }
        this.dispatchEvent(this.createUpdateLevelEvent());
        this.xpThreshold = this.increaseXpThreshold();
        if(this.level === 0){
            this.levelUpTime = 0;
            this.gemSlots = 1;
        }else if(this.level === 1){
            this.levelUpTime = 30;
            this.gemSlots = 2;
        }
        else if(this.level === 2){
            this.levelUpTime = 600;
            this.gemSlots = 4;
        } else if(this.level === 3){
            this.levelUpTime = 1800;
            this.gemSlots = 6;
        } else if(this.level === 4){
            this.levelUpTime = 3600;
            this.gemSlots = 8;
        }
        popUp(this.level, this.maxMana, this.maxHealth);
        this.updatePlayerInfoBackend();
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
}