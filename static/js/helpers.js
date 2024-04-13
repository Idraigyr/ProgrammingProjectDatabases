import * as THREE from "three";
import {gridCellSize} from "./configs/ViewConfigs.js";
import {gravity} from "./configs/ControllerConfigs.js";

export const assert = function(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }

}
export const setIndexAttribute = function(geometry){
    const numVertices = geometry.attributes.position.count;
    const index = [];
    for (let i = 0; i < numVertices; i++){
        index.push(i);
    }
    geometry.setIndex(index);
}

export const returnMultipliedString = function(string, length){
    let str = "";
    for(let i = 0; i < length; i++){
        str += string;
    }
    return str;
}

export const printFoundationGrid = function(grid, width, length, oneline=false){
    console.log(returnMultipliedString("*", width));
    let arr = "";
    if(oneline){
        for(let i = 0; i < grid.length; i++){
            arr += grid[i] + " ";
        }
    } else {
        for(let i = 0; i < length; i++){
            for(let j = 0; j < width; j++){
                arr += grid[i*width + j] + " ";
            }
            arr += "\n";
        }
    }
    console.log(arr);
    console.log(returnMultipliedString("*", width));
}

export const printGridPath = function(grid, path, width, length, currentNode = null){
    console.log(returnMultipliedString("*", width));
    for(let i = 0; i < length; i++){
            let currentRow = "";
            const rowColor = [];
            for(let j = 0; j < width; j++){
                currentRow += "%c" + grid[i*width + j] + " ";
                if(currentNode === i*width + j){
                    rowColor.push("color: red;");
                    continue;
                }
                if(path.includes(i*width + j)){
                    rowColor.push("color: green;");
                    continue;
                }
                rowColor.push("color: white;");
            }
            if(i % 2 === 0){
                currentRow += " ";
            }
            console.log(currentRow, ...rowColor);
        }
    console.log(returnMultipliedString("*", width));
}

export const returnWorldToGridIndex = function(position){
    return {x: Math.floor(position.x/gridCellSize + 0.5), z: Math.floor(position.z/gridCellSize + 0.5)};
}

export const convertWorldToGridPosition = function (position){
    position.x = Math.floor(position.x/gridCellSize + 0.5)*gridCellSize;
    position.z = Math.floor(position.z/gridCellSize + 0.5)*gridCellSize;
    return position;
}

export const convertGridIndexToWorldPosition = function (position){
    position.x = position.x*gridCellSize;
    position.z = position.z*gridCellSize;
    return position
}

//TODO: fix that added velocity only counts for one frame
export const launchCollidedObject = function (box1, box2, box1Velocity, box2Velocity, box1Mass, box2Mass, deltaTime) {
    const hitVector = new THREE.Vector3(0,10,0);
    // const hitVector = box1.getCenter(new THREE.Vector3()).sub(box2.getCenter(new THREE.Vector3()));
    // hitVector.y += 10;
    hitVector.normalize();
    const totalMass = box1Mass + box2Mass;

    box2Velocity.add(hitVector.multiplyScalar(10 * totalMass / box2Mass));
}

export const pushCollidedObjects = function (box1, box2, box1Velocity, box2Velocity, box1Mass, box2Mass, deltaTime) {
    const distance = box1.getCenter(new THREE.Vector3()).distanceTo(box2.getCenter(new THREE.Vector3()));

    const totalMass = box1Mass + box2Mass;
    const relativeVelocity = box1Velocity.clone().sub(box2Velocity);
    const normal = box1.getCenter(new THREE.Vector3()).sub(box2.getCenter(new THREE.Vector3())).normalize();
    const impulse = 2 * relativeVelocity.dot(normal) / totalMass * Math.max(1, Math.min(200,1/Math.pow(distance,4)));
    box1Velocity.sub(normal.clone().multiplyScalar(impulse * box2Mass));
    box2Velocity.add(normal.clone().multiplyScalar(impulse * box1Mass));
}


export const adjustVelocity = function (staticBox, movableBox, boxVelocity){ //box1 = spell
    const characterCenter = movableBox.getCenter(new THREE.Vector3());
    const hitVector = new THREE.Vector3().copy(staticBox.getCenter(new THREE.Vector3())).sub(characterCenter);

    let box2CenterLow = new THREE.Vector3().copy(characterCenter).setY(movableBox.min.y);
    if(staticBox.containsPoint(box2CenterLow)){ //currently does not do anything movableBox.min.y is somehow always -2
        boxVelocity.y += staticBox.max.y - box2CenterLow.y;
    }

    //TODO: instead of projecting the velocity onto the hitVector, split the velocity into its three components and throw away the component(s) that is in the direction of the StaticBox?

    const projected = boxVelocity.clone().projectOnVector(hitVector);
    boxVelocity.sub(projected);
}

const delta = 0.1;
export const adjustVelocity2 = function (staticBox, movableBox, boxVelocity, deltaTime){
    let standingOnCollidable = false;
    if(Math.abs(staticBox.min.x - movableBox.max.x) < delta && boxVelocity.x < 0){
        boxVelocity.x = 0;
    }
    if(Math.abs(staticBox.max.x - movableBox.min.x) < delta && boxVelocity.x > 0){
        boxVelocity.x = 0;
    }
    if(Math.abs(staticBox.min.y - movableBox.max.y) < delta && boxVelocity.y < 0){
        console.log("bottom y")
        console.log(boxVelocity.y)
        console.log(gravity*deltaTime)
        boxVelocity.y = 0;
        standingOnCollidable = true;
    }
    if(Math.abs(staticBox.max.y - movableBox.min.y) < delta && boxVelocity.y > 0){
        console.log("top y")
        boxVelocity.y = 0;
        standingOnCollidable = true;
    }
    if (Math.abs(staticBox.min.z - movableBox.max.z) < delta && boxVelocity.z < 0){
        boxVelocity.z = 0;
    }
    if(Math.abs(staticBox.max.z - movableBox.min.z) < delta && boxVelocity.z > 0){
        boxVelocity.z = 0;
    }
    return standingOnCollidable;
}

export const adjustVelocity3 = function (staticBox, movableBox, boxVelocity){
    let standingOnCollidable = false;
    if(staticBox.min.x - movableBox.max.x < 0 && boxVelocity.x < 0){
        boxVelocity.x = 0;
    }
    if(movableBox.min.x - staticBox.max.x < 0 && boxVelocity.x > 0){
        boxVelocity.x = 0;
    }
    if(staticBox.min.z - movableBox.max.z < 0 && boxVelocity.z < 0){
        boxVelocity.z = 0;
    }
    if(movableBox.min.z - staticBox.max.z < 0 && boxVelocity.z > 0){
        boxVelocity.z = 0;
    }
    if(staticBox.min.y - movableBox.max.y < 0 && boxVelocity.y < 0){
        boxVelocity.y = 0;
    }
    if(movableBox.min.y - staticBox.max.y < 0 && boxVelocity.y > 0){
        boxVelocity.y = 0;
        standingOnCollidable = true;
    }
    return standingOnCollidable;
}

/**
 * Get file extension from path
 * @param path - the path to the file
 * @returns {String} the file extension
 */
export const getFileExtension = function(path){
    return path.slice((path.lastIndexOf(".") - 1 >>> 0) + 2);
}

/**
 * Draw a bounding box around an object
 * @param object - the object to draw the bounding box around
 * @param scene - the scene to add the bounding box to
 */
export function drawBoundingBox(object, scene){
    const objectBoundingBox = new THREE.Box3().setFromObject(object);
    const boxSize = objectBoundingBox.getSize(new THREE.Vector3());
    const boxCenter = objectBoundingBox.getCenter(new THREE.Vector3());
    let boundingBox = new THREE.BoxHelper(object, 0xffff00);
    boundingBox.scale.set(boxSize.x, boxSize.y, boxSize.z);
    boundingBox.position.copy(boxCenter);
    scene.add(boundingBox);
}

export function scaleAndCorrectPosition(object, viewManager=undefined){
        let extracted;
        if (object instanceof THREE.Object3D) {extracted = object;}
        else {extracted = extractObject(object, viewManager);}
        correctRitualScale(extracted);
        convertGridIndexToWorldPosition(extracted.position);
        //correctRitualPosition(extracted);
    }

export function extractObject(object, viewManager){
        if(!object || object instanceof Object3D) return object;
        const {_, view} = viewManager.getPair(object);
        if(view) return view.charModel;
        return object.charModel;
}
export function correctRitualPosition(object) {
    object.position.x = Math.floor(object.position.x / gridCellSize + 0.5) * gridCellSize;
    object.position.z = Math.floor(object.position.x / gridCellSize + 0.5) * gridCellSize;
    // Centralize the object, because now the left bottom corner is in the center of the cell
    // const boundingBox = new THREE.Box3().setFromObject(object);
    // object.position.add(new THREE.Vector3(-(boundingBox.max.x-boundingBox.min.x) / 2.0, 0, -(boundingBox.max.z-boundingBox.min.z) / 2.0));
}

/**
 * Returns the cells occupied by the building
 * @param building THREE.Object3D
 * @returns {*[]} array of the occupied cells
 */
export function getOccupiedCells(building){
    let cells = [];
    // Create bounding box
    const boundingBox = new THREE.Box3().setFromObject(building);
    let min = boundingBox.min;
    let max = boundingBox.max;
    convertWorldToGridPosition(min);
    convertWorldToGridPosition(max);
    for(let x = min.x; x <= max.x; x++){
        for(let z = min.z; z <= max.z; z++){
            cells.push({x: x, z: z});
        }
    }
    // Print occupied cells
    // console.log("occupied cells:", cells);
    return cells;
}

export function setMinimumY(object, y){
    const boundingBox = new THREE.Box3().setFromObject(object);
    object.position.y += y - boundingBox.min.y;
}

export function correctRitualScale(object){
        let boundingBox = new THREE.Box3().setFromObject(object);
        const minVec = boundingBox.min;
        const maxVec = boundingBox.max;
        const difVec = maxVec.sub(minVec);
        const biggestSideLength = Math.max(Math.abs(difVec.x), Math.abs(difVec.z));
        const scaleFactor = gridCellSize/biggestSideLength;
        object.scale.set(scaleFactor*object.scale.x, scaleFactor*object.scale.y, scaleFactor*object.scale.z);
}

/*
const timeout = function (s) {
    return new Promise(function(_,reject){
        setTimeout(function(){
            reject(new Error(`Request took too long! timeout after ${s} seconds`));
        }, s*1000);
    });
}

export const AJAX = async function(url,uploadData = undefined){
    try{
        const fetchPro = uploadData ? fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        }) : fetch(url);
        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
        const data = await res.json();
        if (!res.ok) throw new Error(`${data.message} (${res.status})`);
        return data;
    } catch (err){
        throw err;
    }
}
*/