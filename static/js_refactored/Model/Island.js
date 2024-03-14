import {Entity} from "./Entity.js";

export class Island extends Entity{
    #phi = 0;
    #theta = 0;
    plane;
    constructor(position, rotation) {
        super();
        this.buildings = [];
        this.rotation = rotation;
    }
    setPlane(plane){
        this.plane = plane;
    }
    get type(){
        return "island";
    }
}