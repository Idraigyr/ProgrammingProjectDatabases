import {Placeable} from "./Placeable.js";

/**
 * Class for the altar model
 */
export class WarriorHut extends Placeable{
    constructor(params) {
        super(params);
        this.timeToBuild = 1200;
    }

    /**
     * Getter for the database type
     * @returns {string} the database type
     */
    get dbType(){
        return "warrior_hut";
    }
}