import {Placeable} from "./Placeable.js";

/**
 * Class for the Tree model
 */
export class Tree extends Placeable{
    constructor(params) {
        super(params);
        this.timeToBuild = 3;
    }

    get dbType() {
        return "prop";
    }

    formatPOSTData(userInfo){
        const obj = super.formatPOSTData(userInfo);
        obj.prop_type = "tree";
        return obj;
    }
}