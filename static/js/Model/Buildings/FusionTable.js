import {Placeable} from "./Placeable.js";

/**
 * Class for the Fusion table model
 */
export class FusionTable extends Placeable{
    constructor(params) {
        super(params);
        this.timeToBuild = 40;
    }

    get dbType(){
        return "fuse_table";
    }
}