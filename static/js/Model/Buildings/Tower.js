import {Placeable} from "./Placeable.js";

export class Tower extends Placeable{
    constructor(params) {
        super(params);
        this.spellSpawner = params.spellSpawner;
    }

    get dbType(){
        return "tower_building";
    }

    formatPOSTData(userInfo){
        const obj = super.formatPOSTData(userInfo);
        obj.tower_type = "magic";
        return obj;
    }
}