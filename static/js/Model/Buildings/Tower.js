import {Placeable} from "./Placeable.js";

/**
 * Class for the Tower model

 */
export class Tower extends Placeable{
    constructor(params) {
        super(params);
        this.spellSpawner = params.spellSpawner;
    }

    /**
     * Getter for the database type
     * @returns {string} the database type
     */
    get dbType(){
        return "tower_building";
    }

    /**
     * Formats the data for a POST request
     * @param userInfo {JSON} the user information
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} returns formatted data
     */
    formatPOSTData(userInfo){
        const obj = super.formatPOSTData(userInfo);
        obj.tower_type = "magic";
        return obj;
    }

    /**
     * Formats the data for a PUT request
     * @param userInfo {JSON} the user information
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} returns formatted data
     */
    formatPUTData(userInfo){
        const obj = super.formatPUTData(userInfo);
        obj.tower_type = "magic";
        return obj;
    }
}