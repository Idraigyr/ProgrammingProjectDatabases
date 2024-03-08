import {Building} from "../BuildingView.js";
import {minePath} from "../../configs/ViewConfigs.js";

export class Mine extends Building{
    constructor() {
        super();
        this.assetPath = minePath;
    }
}