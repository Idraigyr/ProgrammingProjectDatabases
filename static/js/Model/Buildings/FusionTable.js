import {Placeable} from "./Placeable.js";

/**
 * Class for the Fusion table model
 */
export class FusionTable extends Placeable{
    constructor(params) {
        super(params);
        this.timeToBuild = 60;
    }

    get dbType(){
        return "fuse_table";
    }
}