import {Placeable} from "./Placeable.js";

/**
 * Class for the altar model
 */
export class WarriorHut extends Placeable{
    constructor(params) {
        super(params);
    }

    get dbType(){
        return "warrior_hut_building";
    }
}