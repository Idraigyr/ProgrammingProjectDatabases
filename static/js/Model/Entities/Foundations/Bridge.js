import {Foundation} from "./Foundation.js";

/**
 * Model of a bridge
 */
export class Bridge extends Foundation{
    constructor(params) {
        super(params);
    }

    get type(){
        return "island";
    }
}