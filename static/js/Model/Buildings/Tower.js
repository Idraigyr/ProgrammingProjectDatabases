import {Placeable} from "./Placeable.js";

export class Tower extends Placeable{
    constructor(params) {
        super(params);
        this.spellSpawner = params.spellSpawner;
    }

    get dbType(){
        return "tower_building";
    }
}