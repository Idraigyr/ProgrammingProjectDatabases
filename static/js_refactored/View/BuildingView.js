import {IView} from "./View.js";

export class Building extends IView{
    constructor(params) {
        super(params);
        this.boundingBox.setFromObject(this.charModel);
    }
}