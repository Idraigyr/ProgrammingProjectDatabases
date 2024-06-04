import {Building} from "../BuildingView.js";

/**
 * Tower building view
 */
export class Tower extends Building{
    constructor(params) {
        super(params);
        this.charModel.translateY(-2);
    }
}