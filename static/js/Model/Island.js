import {Entity} from "./Entity.js";
import {returnWorldToGridIndex} from "../helpers.js";

const type = (function (){
    const number = {
        empty: 0,
        altar_building: 1,
        mine_building: 2,
        tower: 3,
        prop: 4
    };
    const name = {
        0: "empty",
        1: "altar_building",
        2: "mine_building",
        3: "tower_building",
        4: "prop"
    }
    return {
        getNumber: function (name) {
            return number[name];
        },
        getName: function (number) {
            return name[number];
        }
    };
})();

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
        this.width = params.width;
        this.length = params.length;
        this.height = params?.height ?? 0;
        // this.grid = new Array(params.width).fill(0).map(() => new Array(params.length).fill(0).map(() => new Array(params.height).fill(0)));
        this.grid = new Array(params.width).fill(0).map(() => new Array(params.length).fill(0));
        this.occupiedCells = [];
    }

    occupyCell(worldPosition, dbType){
        let {x, z} = returnWorldToGridIndex(worldPosition);
        console.log(`occupied cell: ${x}, ${z} with ${dbType}`);
        this.grid[x + 7][z + 7] = type.getNumber(dbType);
    }

    freeCell(worldPosition){
        let {x, z} = returnWorldToGridIndex(worldPosition);
        this.grid[x + 7][z + 7] = type.getNumber("empty");
    }

    checkCell(worldPosition){
        let {x, z} = returnWorldToGridIndex(worldPosition);
        return type.getName(this.grid[x + 7][z + 7]);
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
        this.occupyCell(building.position, building.dbType);
    }
}