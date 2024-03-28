import {Building} from "../BuildingView.js";

export class Tower extends Building{
    constructor(params) {
        super(params);
        this.charModel.translateY(-2);
    }
}