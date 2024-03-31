import {Entity} from "./Entity.js";

/**
 * Model of an island
 */
export class Island extends Entity{
    #phi = 0;
    #theta = 0;
    constructor(position, rotation) {
        super();
        this.buildings = [];
        this.rotation = rotation;
        this.occupiedCells = [];
    }
    get type(){
        return "island";
    }

    addBuilding(building){
        this.buildings.push(building);
    }
}