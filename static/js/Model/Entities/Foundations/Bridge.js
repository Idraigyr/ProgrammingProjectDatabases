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

    /**
     * Get the type of the item
     * @returns {string} - the type of the item
     */
    get type(){
        return "island";
    }
}