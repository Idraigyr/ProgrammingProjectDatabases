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

    getBuildingByPosition(position){
        return this.getBuildingByIndex(returnWorldToGridIndex(position));
    }

    getBuildingByIndex(index){
        return this.buildings.find(building => building.cellIndex === index);
    }

    occupyCell(worldPosition, dbType){
        let {x, z} = returnWorldToGridIndex(worldPosition.sub(this.position));
        const index = (x + (this.width - 1)/2)*this.width + (z + (this.length -1)/2);
        // this.grid[x + 7][z + 7] = buildTypes.getNumber(dbType);
        this.grid[index] = buildTypes.getNumber(dbType);
        return index;
    }

    freeCell(worldPosition){
        let {x, z} = returnWorldToGridIndex(worldPosition.sub(this.position));
        // this.grid[x + 7][z + 7] = buildTypes.getNumber("empty");
        this.grid[(x + (this.width - 1)/2)*this.width + (z + (this.length -1)/2)] = buildTypes.getNumber("empty");
    }

    checkCell(worldPosition){
        let {x, z} = returnWorldToGridIndex(worldPosition.sub(this.position));
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
}