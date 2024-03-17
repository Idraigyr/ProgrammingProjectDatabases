import {Entity} from "../Entity.js"

/**
 * Base class for the placeable model
 */
export class Placeable extends Entity{
    constructor(params) {
        super();
        params? this.rotation = params.rotation : this.rotation = 0;
    }

    get type(){
        return "building";
    }
}