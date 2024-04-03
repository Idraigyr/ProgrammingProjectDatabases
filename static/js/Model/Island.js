import {Entity} from "./Entity.js";
import {returnWorldToGridIndex} from "../helpers.js";
import * as THREE from "three";
import {buildTypes} from "../configs/Enums.js";

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
        this.min = new THREE.Vector3();
        this.max = new THREE.Vector3();
        // this.grid = new Array(params.width).fill(0).map(() => new Array(params.length).fill(0).map(() => new Array(params.height).fill(0)));
        this.grid = new Array(params.width).fill(buildTypes.getNumber("empty")).map(() => new Array(params.length).fill(buildTypes.getNumber("empty")));
        this.occupiedCells = [];
    }

    occupyCell(worldPosition, dbType){
        let {x, z} = returnWorldToGridIndex(worldPosition);
        this.grid[x + 7][z + 7] = buildTypes.getNumber(dbType);
    }

    freeCell(worldPosition){
        let {x, z} = returnWorldToGridIndex(worldPosition);
        this.grid[x + 7][z + 7] = buildTypes.getNumber("empty");
    }

    checkCell(worldPosition){
        let {x, z} = returnWorldToGridIndex(worldPosition);
        return buildTypes.getName(this.grid[x + 7][z + 7]);
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

    set position(vector){
        const delta = vector.clone().sub(this.position);
        this.min.add(delta);
        this.max.add(delta);
        for(const building of this.buildings){
            building.position = building.position.add(delta);
        }
        super.position = vector;
    }

    get type(){
        return "island";
    }

    addBuilding(building){
        this.buildings.push(building);
        this.occupyCell(building.position, building.dbType);
    }
}