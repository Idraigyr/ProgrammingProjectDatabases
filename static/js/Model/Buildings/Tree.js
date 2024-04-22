import {Placeable} from "./Placeable.js";

/**
 * Class for the Tree model
 */
export class Tree extends Placeable{
    constructor(params) {
        super(params);
        this.timeToBuild = 5;
    }

    /**
     * Getter for the database type
     * @returns {string} the database type
     */
    get dbType() {
        return "prop";
    }

    /**
     * Formats the data for a POST request
     * @param userInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} the building type
     */
    formatPOSTData(userInfo, islandPosition){
        const obj = super.formatPOSTData(userInfo, islandPosition);
        delete obj.level;
        obj.prop_type = "Tree";
        return obj;
    }

    /**
     * Formats the data for a PUT request
     * @param userInfo {JSON} the user information
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} the building type
     */
    formatPUTData(userInfo){
        const obj = super.formatPUTData(userInfo);
        obj.prop_type = "tree";
        return obj;
    }
}