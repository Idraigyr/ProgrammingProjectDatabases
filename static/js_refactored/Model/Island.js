import {Subject} from "../Patterns/Subject.js";

export class Island extends Subject{
    #phi = 0;
    #theta = 0;
    constructor(position, rotation) {
        super();
        this.buildings = [];
        this.position = position;
        this.rotation = rotation;
    }
}