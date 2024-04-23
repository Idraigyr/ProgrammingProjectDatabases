import {Entity} from "../Entity.js"
import * as THREE from "three";
import {convertWorldToGridPosition} from "../../helpers.js";
import {gridCellSize} from "../../configs/ViewConfigs.js";
import {popUp} from "../../external/LevelUp.js";

/**
 * Base class for the placeable model
 */
export class Placeable extends Entity{
    constructor(params) {
        super(params);
        this.id = params?.id ?? null;
        this.level = params?.level ?? 0;
        this.rotation = params?.rotation ??  0;
        this.gemSlots = params?.gemSlots ?? 1;
        this.levelUpTime = params?.levelUpTime ?? 0;
        this.gems = [];
        this.ready = true;
        this.cellIndex = null;
        this.timeToBuild = 10; // in seconds
    }

    setId(data){
       this.id = data.placeable_id;
    }

    /**
     * Formats the data for a POST request
     * @param userInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} returns formatted data
     */
    formatPOSTData(userInfo, islandPosition){
        const gridPos = new THREE.Vector3().copy(this.position);
        gridPos.add(islandPosition);
        convertWorldToGridPosition(gridPos);
        const obj = {
            island_id: userInfo.islandID,
            x: gridPos.x/gridCellSize,
            z: gridPos.z/gridCellSize,
            rotation: this.rotation/90,
            // type: this.dbType,
            level: this.level,
            // gems: []

        };
        for(const gem of this.gems){
            //obj.gems.push(gem.formatPOSTData(userInfo));
        }
        return obj;
    }

    /**
     * Formats the data for a PUT request
     * @param userInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} returns formatted data
     */
    formatPUTData(userInfo, islandPosition){
       const obj = this.formatPOSTData(userInfo, islandPosition);
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
        this.xpTreshold = this.increaseXpTreshold();
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
        return true;
    }

    /**
     * Create an event for updating the rotation
     */
    // TODO: move it entity class and add degrees as parameter (default 90)
    rotate(){
        this.rotation += 90;
        this.rotation %= 360;
        // Create quaternion from rotation
        let quaternion = new THREE.Quaternion();
        quaternion.setFromEuler(new THREE.Euler(0, this.rotation * Math.PI / 180, 0));
        this.dispatchEvent(new CustomEvent("updateRotation", {detail: {rotation: quaternion}}));
    }
}