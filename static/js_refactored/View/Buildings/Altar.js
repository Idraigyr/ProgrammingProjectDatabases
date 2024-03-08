import {Building} from "../BuildingView.js";
import {altarPath} from "../../configs/ViewConfigs.js";

export class Altar extends Building{
    constructor() {
        super();
        this.assetPath = altarPath;
    }
}