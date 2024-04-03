import {Placeable} from "./Placeable.js";

/**
 * Class for the mine model
 */
export class Mine extends Placeable{
    constructor(params) {
        super(params);
        this.timeToBuild = 10;
    }

    get dbType(){
        return "mine_building";
    }
}