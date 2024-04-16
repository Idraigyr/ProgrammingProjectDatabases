import {Placeable} from "./Placeable.js";

/**
 * Class for the Tree model
 */
export class Tree extends Placeable{
    constructor(params) {
        super(params);
        this.timeToBuild = 3;
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
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} the building type
     */
    formatPOSTData(userInfo){
        const obj = super.formatPOSTData(userInfo);
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