import * as THREE from "three";
import {gridCellSize} from "../configs/ViewConfigs.js";
import {buildTypes} from "../configs/Enums";
import {returnWorldToGridIndex} from "../helpers.js";

export class MinionController{
    constructor(params) {
        this.minions = [];
        this.collisonDetector = params.collisionDetector;
        this.worldMap = this.calculateWorldMap(params.islands);
    }

    calculatePath(start, end){

    }
    calculateWorldMap(islands){
        //TODO: based on the grid and position of the islands, create a 2D array that represents the world
        let min = new THREE.Vector3(Infinity,Infinity,Infinity);
        let max = new THREE.Vector3(-Infinity,-Infinity,-Infinity);
        for(const island of islands){
            if(island.position.x < min.x) min.x = island.position.x;
            if(island.position.z < min.z) min.z = island.position.z;
            if(island.position.x > max.x) max.x = island.position.x;
            if(island.position.z > max.z) max.z = island.position.z;
        }
        let width = Math.ceil((max.x - min.x)/gridCellSize);
        let length = Math.ceil((max.z - min.z)/gridCellSize);
        let worldMap = new Array(width*length).fill(buildTypes.getNumber("empty"));
        for(const island of islands){
            // let {x,z} = returnWorldToGridIndex(island.position);
            // worldMap[x*width + z] = buildTypes.getNumber("island");
        }
        console.log("worldMap:");
        for(let i = 0; i < width; i++){
            let row = "";
            for(let j = 0; j < length; j++){
                row += worldMap[i*width + j] + " ";
            }
            console.log(row);
        }
        return worldMap;
    }

}