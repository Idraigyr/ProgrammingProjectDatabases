import {Placeable} from "./Placeable.js";

/**
 * Class for the Bush model
 */
export class Bush extends Placeable{
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
     * @returns {JSON} the building type
     */
    formatPOSTData(userInfo){
        const obj = super.formatPOSTData(userInfo);
        delete obj.level;
        obj.prop_type = "Bush";
        return obj;
    }

    /**
     * Formats the data for a PUT request
     * @param userInfo {JSON} the user information
     * @returns {*} the building type
     */
    formatPUTData(userInfo){
        const obj = super.formatPUTData(userInfo);
        obj.prop_type = "bush";
        return obj;
    }
}