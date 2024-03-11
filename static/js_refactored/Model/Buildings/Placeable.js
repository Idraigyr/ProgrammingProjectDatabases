import {Entity} from "../Entity.js"

export class Placeable extends Entity{
    constructor(params) {
        super();
        this.rotation = params.rotation;
    }

    get type(){
        return "building";
    }
}