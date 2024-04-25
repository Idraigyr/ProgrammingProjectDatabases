import * as THREE from "three";
import {MinionController} from "../Controller/MinionController.js";
import {Foundation} from "../Model/Entities/Foundations/Foundation.js";
import {assert, convertWorldToGridPosition, printFoundationGrid} from "../helpers.js";
import {gridCellSize} from "../configs/ViewConfigs.js";

const positionVariability = 5;
const islandWidth = 3;
const islandLength = 3;

class island{
    constructor(params) {
        this.position = new THREE.Vector3(params.position.x, params.position.y, params.position.z);
        this.width = params.width; //always odd
        this.length = params.length; //always odd
        this.min = this.position.clone().sub(new THREE.Vector3(((this.width - 1)/2)*gridCellSize, 0, ((this.length - 1)/2)*gridCellSize));
        this.max = this.position.clone().add(new THREE.Vector3(((this.width - 1)/2)*gridCellSize, 0, ((this.length - 1)/2)*gridCellSize));
        this.grid = new Array(this.width*this.length).fill(params.char);
    }
}

function calculateBridgeMetrics(island1, island2, padding= 1){
    assert(island1.width % 2 === 1 && island1.length % 2 === 1, "island1 width and length must be odd");
    assert(island2.width % 2 === 1 && island2.length % 2 === 1, "island2 width and length must be odd");
    assert(island1.position.x%2 === 0 && island1.position.z%2 === 0, "island1 position must be even");
    assert(island2.position.x%2 === 0 && island2.position.z%2 === 0, "island2 position must be even");

    const bridgePosition = convertWorldToGridPosition(island1.position.clone().add(island2.position).divideScalar(2));
    console.log(bridgePosition);

    const xEdgeDiff = island1.position.x > island2.position.x ? island1.min.x - island2.max.x : island2.min.x - island1.max.x;
    const zEdgeDiff = island1.position.z > island2.position.z ? island1.min.z - island2.max.z : island2.min.z - island1.max.z;

    if(xEdgeDiff <= gridCellSize && zEdgeDiff <= gridCellSize){
       throw new Error("islands are too close to each other");
    }

    const xDiff = island1.position.x - island2.position.x;
    const zDiff = island1.position.z - island2.position.z;

    let bridgeMinX, bridgeMaxX, bridgeMinZ, bridgeMaxZ;
    if(zDiff >= 0 && zEdgeDiff > 0 && (xEdgeDiff <= 0 || xEdgeDiff >= zEdgeDiff)){ //island2 is north of island1 + edge cases
        if(xDiff >= 0){ // island2 is north of island1 and west/center of island1
            bridgeMinX = island2.position.x - padding*gridCellSize;
            bridgeMaxX = island1.position.x + padding*gridCellSize;
        } else { // island2 is north of island1 and east of island1
            bridgeMinX = island1.position.x - padding*gridCellSize;
            bridgeMaxX = island2.position.x + padding*gridCellSize;
        }
        bridgeMinZ = island2.max.z + gridCellSize;
        bridgeMaxZ = island1.min.z - gridCellSize;
    } else if(xDiff < 0 && xEdgeDiff > 0 && (zEdgeDiff <= 0 || zEdgeDiff >= xEdgeDiff)){ //island2 is east of island1 + edge cases
        bridgeMinX = island1.max.x + gridCellSize;
        bridgeMaxX = island2.min.x - gridCellSize;
        if(zDiff >= 0){ // island2 is east of island1 and north/center of island1
            bridgeMinZ = island2.position.z - padding*gridCellSize;
            bridgeMaxZ = island1.position.z + padding*gridCellSize;
        } else { // island2 is east of island1 and south of island1
            bridgeMinZ = island1.position.z - padding*gridCellSize;
            bridgeMaxZ = island2.position.z + padding*gridCellSize;
        }
    } else if(zDiff < 0 && zEdgeDiff > 0 && (xEdgeDiff <= 0 || xEdgeDiff >= zEdgeDiff)){ //island2 is south of island1 + edge cases
        if(xDiff >= 0){ // island2 is south of island1 and west/center of island1
            bridgeMinX = island2.position.x - padding*gridCellSize;
            bridgeMaxX = island1.position.x + padding*gridCellSize;
        } else { // island2 is south of island1 and east of island1
            bridgeMinX = island1.position.x - padding*gridCellSize;
            bridgeMaxX = island2.position.x + padding*gridCellSize;
        }
        bridgeMinZ = island1.max.z + gridCellSize;
        bridgeMaxZ = island2.min.z - gridCellSize;
    } else if(xDiff > 0){ //island2 is west of island1 + edge cases
        bridgeMinX = island2.max.x + gridCellSize;
        bridgeMaxX = island1.min.x - gridCellSize;
        if(zDiff >= 0){ // island2 is west of island1 and north/center of island1
            bridgeMinZ = island2.position.z - padding*gridCellSize;
            bridgeMaxZ = island1.position.z + padding*gridCellSize;
        } else { // island2 is west of island1 and south of island1
            bridgeMinZ = island1.position.z - padding*gridCellSize;
            bridgeMaxZ = island2.position.z + padding*gridCellSize;
        }
    } else {
        throw new Error("no known bridge formation for current island positions");
    }

    return {position: bridgePosition, width: (bridgeMaxX - bridgeMinX)/gridCellSize + 1, length: (bridgeMaxZ - bridgeMinZ)/gridCellSize + 1};
}

//success case
const xpos = [0, 0, 6, -6, 6, 6, -6, -6, 2, -2, 2, -2];
const zpos = [6, -6, 0, 0, 2, -2, 2, -2, 6, 6, -6, -6];
for(let i = 0; i < xpos.length; i++){
    const island1 = new island({
        position: {
            x: 0,
            y: 0,
            z: 0
        },
        width: islandWidth,
        length: islandLength,
        char: "1"
    });
    const island2 = new island({
        position: {
            x: xpos[i]*gridCellSize,
            y: 0,
            z: zpos[i]*gridCellSize
        },
        width: islandWidth,
        length: islandLength,
        char: "2"
    });

    const {position, width, length} = calculateBridgeMetrics(island1, island2, 0);

    const bridge = new island({
        position: position,
        width: width,
        length: length,
        char: "b"
    });

    const foundation = new Foundation({});
    console.log("--------------------------------");
    foundation.setFromFoundations([island1, island2, bridge]);
    printFoundationGrid(foundation.grid, foundation.width, foundation.length);
    console.log("--------------------------------");

}

//failure case
const xpos2 = [0, 0, 7, -7, 7, 7, -7, -7, 2, -2, 2, -2];
const zpos2 = [7, -7, 0, 0, 2, -2, 2, -2, 7, 7, -7, -7];
for(let i = 0; i < xpos2.length; i++){
    const island1 = new island({
        position: {
            x: 0,
            y: 0,
            z: 0
        },
        width: islandWidth,
        length: islandLength,
        char: "1"
    });
    const island2 = new island({
        position: {
            x: xpos2[i]*gridCellSize,
            y: 0,
            z: zpos2[i]*gridCellSize
        },
        width: islandWidth,
        length: islandLength,
        char: "2"
    });

    const {position, width, length} = calculateBridgeMetrics(island1, island2, 0);

    const bridge = new island({
        position: position,
        width: width,
        length: length,
        char: "b"
    });

    const foundation = new Foundation({});
    console.log("--------------------------------");
    try {
        foundation.setFromFoundations([island1, island2, bridge]);
        printFoundationGrid(foundation.grid, foundation.width, foundation.length);
    } catch (e) {
        console.log(e.message);
    }
    console.log("--------------------------------");

}
