import {Placeable} from "./Placeable.js";

/**
 * Class for the Bush model
 */
export class Bush extends Placeable{
    constructor(params) {
        super(params);
        this.timeToBuild = 5;
    }

    get dbType() {
        return "prop";
    }

    formatPOSTData(userInfo){
        const obj = super.formatPOSTData(userInfo);
        obj.prop_type = "bush";
        return obj;
    }
}