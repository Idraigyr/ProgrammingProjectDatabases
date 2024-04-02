import {Entity} from "../Entity.js"

/**
 * Base class for the placeable model
 */
export class Placeable extends Entity{
    constructor(params) {
        super(params);
        params? this.rotation = params.rotation : this.rotation = 0;
        this.occupiedCells = [];
        this.timeToBuild = 0; // in seconds
    }

    get type(){
        return "building";
    }
}