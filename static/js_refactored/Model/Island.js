import {Entity} from "./Entity.js";

/**
 * Model of an island
 */
export class Island extends Entity{
    #phi = 0;
    #theta = 0;
    constructor(position, rotation) {
        super();
        this.buildings = [];
        this.rotation = rotation;
    }
    get type(){
        return "island";
    }
}