import * as $ from "jquery";
import {Vector3} from "three";
import {API_URL} from "./config.js"
export class World {
    #entities
    constructor() {
        const data = $.getJSON(`${API_URL}/resources/`,function(data){

        });
    }
}

class Entity {
    constructor() {
        this.normal = new Vector3(1,0,0);
        this.position = new Vector3(0,0,0);
    }
}
export class Character extends Entity {
    constructor() {
        super();
    }
}
