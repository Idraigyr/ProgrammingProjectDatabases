import {Foundation} from "./Foundation.js";
import {buildTypes} from "../../../configs/Enums.js";

/**
 * Model of a bridge
 */
export class Bridge extends Foundation{
    constructor(params) {
        super(params);
        this.grid.fill(buildTypes.getNumber("bridge"));
    }

    get type(){
        return "island";
    }
}