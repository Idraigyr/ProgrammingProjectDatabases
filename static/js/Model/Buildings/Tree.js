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
        delete obj.level;
        obj.prop_type = "Tree";
        return obj;
    }
    formatPUTData(userInfo){
        const obj = super.formatPUTData(userInfo);
        obj.prop_type = "tree";
        return obj;
    }
}