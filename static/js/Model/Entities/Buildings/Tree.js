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
     * @param playerInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} the building type
     */
    formatPOSTData(playerInfo, islandPosition){
        const obj = super.formatPOSTData(playerInfo, islandPosition);
        delete obj.level;
        obj.prop_type = "Tree";
        return obj;
    }

    /**
     * Formats the data for a PUT request
     * @param playerInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} the building type
     */
    formatPUTData(playerInfo, islandPosition){
        const obj = super.formatPUTData(playerInfo, islandPosition);
        obj.prop_type = "tree";
        return obj;
    }
}