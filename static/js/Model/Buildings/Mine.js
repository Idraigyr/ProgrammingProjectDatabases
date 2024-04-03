import {Placeable} from "./Placeable.js";

/**
 * Class for the mine model
 */
export class Mine extends Placeable{
    constructor(params) {
        super(params);
        this.timeToBuild = 10;
    }

    get dbType(){
        return "mine_building";
    }

    formatPOSTData(userInfo){
        const obj = super.formatPOSTData(userInfo);
        obj.mine_type = "crystal";
        return obj;
    }
}