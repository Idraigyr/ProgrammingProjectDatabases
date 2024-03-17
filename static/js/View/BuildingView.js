import {IView} from "./View.js";

/**
 * Building view base class
 */
export class Building extends IView{
    constructor(params) {
        super(params);
        this.boundingBox.setFromObject(this.charModel);
    }
}