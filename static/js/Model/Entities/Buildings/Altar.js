import {Placeable} from "./Placeable.js";

/**
 * Class for the altar model
 */
export class Altar extends Placeable{
    constructor(params) {
        super(params);
    }

    /**
     * Getter for the database type
     * @returns {string} the database type
     */
    get dbType(){
        return "altar_building";
    }
}