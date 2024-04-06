import {Entity} from "./Entity.js";
import {returnWorldToGridIndex} from "../helpers.js";
import * as THREE from "three";
import {buildTypes} from "../configs/Enums.js";

/**
 * Model of an island
 */
export class Island extends Entity{
    /**
     *
     * @param {{width: Number, length: Number, rotation: Number, height: Number}} params - width and length are always uneven, if not they are increased by 1. height is always larger than 0 otherwise = 0.1
     */
    constructor(params) {
        super(params);
        this.buildings = [];
        this.rotation = params.rotation;

        this.width = params?.width ?? 15;
        this.width = this.width % 2 === 0 ? this.width + 1 : this.width;

        this.length = params?.length ?? 15;
        this.length = this.length % 2 === 0 ? this.length + 1 : this.length;

        this.height = params?.height ?? 0;
        this.height = this.height > 0 ? this.height : 0.1;

        this.min = new THREE.Vector3();
        this.max = new THREE.Vector3();
        // this.grid = new Array(params.width).fill(buildTypes.getNumber("empty")).map(() => new Array(params.length).fill(buildTypes.getNumber("empty")));
        this.grid = new Array(params.width*params.length).fill(buildTypes.getNumber("empty"))
    }

    occupyCell(worldPosition, dbType){
        let {x, z} = returnWorldToGridIndex(worldPosition);
        // this.grid[x + 7][z + 7] = buildTypes.getNumber(dbType);
        this.grid[(x + (this.width - 1)/2)*this.width + (z + (this.length -1)/2)] = buildTypes.getNumber(dbType);
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