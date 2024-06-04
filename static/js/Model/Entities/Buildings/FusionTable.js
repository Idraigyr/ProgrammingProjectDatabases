import {Placeable} from "./Placeable.js";

/**
 * Class for the Fusion table model
 */
export class FusionTable extends Placeable{
    constructor(params) {
        super(params);
        this.timeToBuild = 900;
        this.upgradable = true;
    }

    /**
     * Getter for the database type
     * @returns {string} the database type
     */
    get dbType(){
        return "fuse_table";
    }
}