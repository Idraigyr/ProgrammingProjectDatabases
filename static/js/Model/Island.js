import {returnWorldToGridIndex} from "../helpers.js";
import {buildTypes} from "../configs/Enums.js";
import {Foundation} from "./Foundation.js";

/**
 * Model of an island
 */
export class Island extends Foundation{
    /**
     *
     * @param {{width: Number, length: Number, rotation: Number, height: Number}} params - width and length are always uneven, if not they are increased by 1. height is always larger than 0 otherwise = 0.1
     */
    constructor(params) {
        super(params);
        this.buildings = [];
        // is 1d array more optimal than 2d array?
        // this.grid = new Array(params.width).fill(buildTypes.getNumber("empty")).map(() => new Array(params.length).fill(buildTypes.getNumber("empty")));
    }

    occupyCell(worldPosition, dbType){
        let {x, z} = returnWorldToGridIndex(worldPosition);
        const index = (x + (this.width - 1)/2)*this.width + (z + (this.length -1)/2);
        // this.grid[x + 7][z + 7] = buildTypes.getNumber(dbType);
        this.grid[index] = buildTypes.getNumber(dbType);
        return index;
    }

    freeCell(worldPosition){
        let {x, z} = returnWorldToGridIndex(worldPosition);
        // this.grid[x + 7][z + 7] = buildTypes.getNumber("empty");
        this.grid[(x + (this.width - 1)/2)*this.width + (z + (this.length -1)/2)] = buildTypes.getNumber("empty");
    }

    checkCell(worldPosition){
        let {x, z} = returnWorldToGridIndex(worldPosition);
        // return buildTypes.getName(this.grid[x + 7][z + 7]);
        return this.grid[(x + (this.width - 1)/2)*this.width + (z + (this.length -1)/2)];
    }

    set position(vector){
        const delta = vector.clone().sub(this.position);
        for(const building of this.buildings){
            building.position = building.position.add(delta);
        }
        super.position = vector;
    }

    get position(){
        return super.position;
    }

    get type(){
        return "island";
    }

    addBuilding(building){
        this.buildings.push(building);
        building.cellIndex = this.occupyCell(building.position, building.dbType);
    }
    getBuildingByPosition(position){
        let pos = position.clone();
        pos = returnWorldToGridIndex(pos);
        // Transform position to cell index
        pos = (pos.x + (this.width - 1)/2)*this.width + (pos.z + (this.length -1)/2);
        return this.getBuildingByIndex(pos);
    }
    getBuildingByIndex(index){
        return this.buildings.find(building => building.cellIndex === index);
    }
}