import {Placeable} from "./Placeable.js";

/**
 * Class for the mine model
 */
export class Mine extends Placeable{
    constructor(params) {
        super(params);
    }

    get dbType(){
        return "mine_building";
    }
}