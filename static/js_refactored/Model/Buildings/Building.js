import {Subject} from "../../Patterns/Subject.js";

export class Building extends Subject{
    constructor(params) {
        super();
        this.position = params.position;
        this.rotation = params.rotation;
    }
}