import {Entity} from "./Entity.js";

/**
 * Model of an island
 */
export class Island extends Entity{
    #phi = 0;
    #theta = 0;
    constructor(params) {
        super(params);
        this.buildings = [];
        this.rotation = params.rotation;
    }
    get type(){
        return "island";
    }
}