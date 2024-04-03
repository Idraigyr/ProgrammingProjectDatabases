import {Entity} from "./Entity.js";

/**
 * Model of an island
 */
export class Island extends Entity{
    #phi = 0;
    #theta = 0;
    constructor(params) {
        super(params);
        this.buildings = [];
        this.rotation = params.rotation;
        this.occupiedCells = [];
    }

    updateOccupiedCells(){
        this.occupiedCells = [];
        this.buildings.forEach(building => {
            building.occupiedCells.forEach(cell => {
                let newCell = {x: cell.x, z: cell.z, building: building};
                this.occupiedCells.push(newCell);
            });
        });
    }

    get type(){
        return "island";
    }

    addBuilding(building){
        this.buildings.push(building);
    }
}