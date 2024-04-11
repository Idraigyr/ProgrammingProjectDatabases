import {Foundation} from "./Foundation.js";

export class Bridge extends Foundation{
    constructor(params) {
        super(params);
    }

    get type(){
        return "bridge";
    }
}