import * as THREE from "three";
import {gridCellSize} from "./configs/ViewConfigs.js";
import {gravity} from "./configs/ControllerConfigs.js";

/**
 * Assert the condition
 * @param condition - the condition to assert
 * @param message - the message to display if the condition is not met
 */
export const assert = function(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }

}

/**
 * performance meter to measure execution time for possibly multiple intervals at the same time
 * @type {{start: function, end: function}}
 * both start and end take a key as argument to identify the interval
 */
export const performanceMeter = (function(){
    let start = new Map();
    return {
        start: function(key){
            start.set(key, performance.now());
        },
        end: function(key){
            const end = performance.now();
            console.log(`Performance of ${key}: ${end - start.get(key)} ms`);
            start.delete(key);
        }
    }
})();

function padLeadingZeros(num, size) {
    return num.toString().padStart(size, "0");
}

export const formatSeconds = function(seconds){
    if(seconds >= 3600){
        const hours = Math.floor(seconds/3600);
        return `${padLeadingZeros(hours,2)}:${padLeadingZeros(Math.floor((seconds - hours*3600)/60),2)}:${padLeadingZeros(seconds%60,2)}`;
    } else if(seconds >= 60){
        return `${padLeadingZeros(Math.floor(seconds/60),2)}:${padLeadingZeros(seconds%60,2)}`;
    } else {
        return `00:${padLeadingZeros(seconds,2)}`;
    }
}

/**
 * Get the time difference in seconds
 * @param time1 - the first time
 * @param time2 - the second time
 * @returns {number} the time difference in seconds
 */
export const timeDifferenceInSeconds = function(time1, time2){
    return Math.round(Math.abs(time1 - time2) / 1000);
}

/**
 * set the index attribute of a geometry
 * @param geometry - the geometry to set the index attribute of
 */
export const setIndexAttribute = function(geometry){
    const numVertices = geometry.attributes.position.count;
    const index = [];
    for (let i = 0; i < numVertices; i++){
        index.push(i);
    }
    geometry.setIndex(index);
}

/**
 * Return the multiplied string
 * @param string - the string to multiply
 * @param length - the length to multiply the string by
 * @returns {string} the multiplied string
 */
export const returnMultipliedString = function(string, length){
    let str = "";
    for(let i = 0; i < length; i++){
        str += string;
    }
    return str;
}

export const getBuildingNumberColor = function(number){
    if(number === 0){
        return "color: black;";
    } else if(number === 1){
        return "color: white;";
    } else if(number === 2){
        return "color: dimgray;";
    } else if(number === 3){
        return "color: aqua;";
    } else if(number === 4){
        return "color: grey;";
    } else if(number === 5){
        return "color: red;";
    } else if(number === 6){
        return "color: fuchsia;";
    } else if(number === 7){
        return "color: darkviolet;";
    } else if(number === 8){
        return "color: orange;";
    } else if(number === 9){
        return "color: brown;";
    }
    return null;

}

/**
 * Print the foundation grid
 * @param grid - the grid to print
 * @param width - the width of the grid
 * @param length - the length of the grid
 * @param oneline - whether to print the grid on one line
 */
export const printFoundationGrid = function(grid, width, length){
    console.log(returnMultipliedString("*", width));
    for(let i = 0; i < length; i++){
        let currentRow = "";
        const rowColor = [];
        for(let j = 0; j < width; j++){
            currentRow += "%c" + grid[i*width + j] + " ";
            const color = getBuildingNumberColor(grid[i*width + j]);
            if(color){
                rowColor.push(color);
                continue;
            }
            rowColor.push("color: white; font-weight: bold;");
        }
        if(i % 2 === 0){
            currentRow += " ";
        }
        console.log(currentRow, ...rowColor);
    }
    console.log(returnMultipliedString("*", width));
}

/**
 * Print the grid with the path
 * @param grid - the grid to print
 * @param path - the path to print
 * @param width - the width of the grid
 * @param length - the length of the grid
 * @param currentNode - the current node to print
 */
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

            const color = getBuildingNumberColor(grid[i*width + j]);
            if(color){
                rowColor.push(color);
                continue;
            }
            rowColor.push("color: white; font-weight: bold;");
        }
        if(i % 2 === 0){
            currentRow += " ";
        }
        console.log(currentRow, ...rowColor);
    }
    console.log(returnMultipliedString("*", width));
}

/**
 * Get grid index from world position assuming the grid is centered around 0,0,0
 * @param position world position
 * @returns {{x: number, z: number}} grid index
 */
export const returnWorldToGridIndex = function(position){
    return {x: Math.floor(position.x/gridCellSize + 0.5), z: Math.floor(position.z/gridCellSize + 0.5)};
}

/**
 * Convert the world position to the grid position assuming the grid is centered around 0,0,0
 * @param position - the world position
 * @returns {*} the grid position
 */
export const convertWorldToGridPosition = function (position){
    position.x = Math.floor(position.x/gridCellSize + 0.5)*gridCellSize;
    position.z = Math.floor(position.z/gridCellSize + 0.5)*gridCellSize;
    return position;
}

/**
 * Convert the grid position to the world position assuming the grid is centered around 0,0,0
 * @param {THREE.Vector3 | {x: number, y: number, z: number}} position - the grid position (is mutated)
 * @returns {*} the world position
 */
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
/**
 * Push the collided objects apart
 * @param box1 - the first object's bounding box
 * @param box2 - the second object's bounding box
 * @param box1Velocity - the velocity of the first object
 * @param box2Velocity - the velocity of the second object
 * @param box1Mass - the mass of the first object
 * @param box2Mass - the mass of the second object
 * @param deltaTime - the time elapsed since the last frame
 */
export const pushCollidedObjects = function (box1, box2, box1Velocity, box2Velocity, box1Mass, box2Mass, deltaTime) {
    return;
    const distance = box1.getCenter(new THREE.Vector3()).distanceTo(box2.getCenter(new THREE.Vector3()));
    const totalMass = box1Mass + box2Mass;
    const relativeVelocity = box1Velocity.clone().sub(box2Velocity);
    const normal = box1.getCenter(new THREE.Vector3()).sub(box2.getCenter(new THREE.Vector3())).normalize();
    const relativeSpeed = relativeVelocity.dot(normal);
    const impulse = 2 * relativeSpeed / totalMass * Math.max(1, Math.min(200,1/Math.pow(distance,4)));
    box1Velocity.sub(normal.clone().multiplyScalar(impulse * box2Mass));
    box2Velocity.add(normal.clone().multiplyScalar(impulse * box1Mass));
}

/**
 * Push the collided objects apart
 * @param {THREE.Box3} box1 - the first object's bounding box
 * @param {THREE.Box3} box2 - the second object's bounding box
 * @param {Character} object1 - the first object
 * @param {Character} object2 - the second object
 * @param deltaTime - the time elapsed since the last frame
 */
export const pushCollidedObjects2 = function (box1, box2, object1, object2, deltaTime) {
    const c1 = box1.getCenter(new THREE.Vector3());
    const c2 = box2.getCenter(new THREE.Vector3());
    const normal = c2.clone().sub(c1).normalize();
    const relativeVelocity = object2.velocity.clone().sub(object1.velocity);
    const relativeSpeed = relativeVelocity.dot(normal);

    if(relativeSpeed > 0) return;
    if(object1.mass === 0){
        const newVelocity2 = object2.velocity.clone().sub(normal.clone().multiplyScalar(2 * relativeSpeed));
        object2.position = object2.position.addScaledVector(newVelocity2, deltaTime)
    } else if(object2.mass === 0){
        const newVelocity1 = object1.velocity.clone().add(normal.clone().multiplyScalar(2 * relativeSpeed));
        object1.position = object1.position.addScaledVector(newVelocity1, deltaTime)
    } else {
        const impulse = 2 * relativeSpeed / (object1.mass + object2.mass);
        const newVelocity1 = object1.velocity.clone().add(normal.clone().multiplyScalar(impulse * object2.mass));
        const newVelocity2 = object2.velocity.clone().sub(normal.clone().multiplyScalar(impulse * object1.mass));
        object1.position = object1.position.addScaledVector(newVelocity1, deltaTime)
        object2.position = object2.position.addScaledVector(newVelocity2, deltaTime)
    }
}

/**
 * Adjust the velocity of the object if it collides with the staticBox
 * @param staticBox - the static box to collide with
 * @param movableBox - the movable box to collide with
 * @param boxVelocity - the velocity of the movable box
 */
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
/**
 * Adjust the velocity of the object if it collides with the staticBox
 * @param staticBox - the static box to collide with
 * @param movableBox - the movable box to collide with
 * @param boxVelocity - the velocity of the movable box
 * @param deltaTime - the time elapsed since the last frame
 * @returns {boolean} whether the movable box is standing on the static box
 */
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

/**
 * Adjust the velocity of the object if it collides with the staticBox
 * @param staticBox - the static box to collide with
 * @param movableBox - the movable box to collide with
 * @param boxVelocity - the velocity of the movable box
 * @returns {boolean} whether the movable box is standing on the static box
 */
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
    const extension = path.slice((path.lastIndexOf(".") + 1));
    if(!(extension.length > 0)) throw new Error(`can't extract extension from ${path}`);
    return extension;
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

/**
 * Scale and correct the position of the object
 * @param object - the object to scale and correct the position of
 * @param viewManager - the viewManager to extract the object from
 */
export function scaleAndCorrectPosition(object, viewManager=undefined){
        let extracted;
        if (object instanceof THREE.Object3D) {extracted = object;}
        else {extracted = extractObject(object, viewManager);}
        correctRitualScale(extracted);
        convertGridIndexToWorldPosition(extracted.position);
        //correctRitualPosition(extracted);
    }

/**
 * Extract the object from the viewManager if it is a view
 * @param object - the object to extract
 * @param viewManager - the viewManager to extract the object from
 * @returns {*|Object3D} the extracted object
 */
export function extractObject(object, viewManager){
        if(!object || object instanceof Object3D) return object;
        const {_, view} = viewManager.getPair(object);
        if(view) return view.charModel;
        return object.charModel;
}

/**
 * Correct the position of the object to fit the grid cell size
 * @param object - the object to correct the position of
 */
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
export function getOccupiedCells(building){ //TODO @Daria: what was this used for? can we remove it?
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


export const mapDegreesToNearestQuarter = function(degrees){
    return Math.round((degrees < 0 ? 360 + degrees%360 : degrees%360)/90)*90;
}

/**
 * Correct the scale of the object to fit the grid cell size
 * @param object - the object to correct the scale of
 */
export function correctRitualScale(object){
        let boundingBox = new THREE.Box3().setFromObject(object);
        const minVec = boundingBox.min;
        const maxVec = boundingBox.max;
        const difVec = maxVec.sub(minVec);
        const biggestSideLength = Math.max(Math.abs(difVec.x), Math.abs(difVec.z));
        const scaleFactor = gridCellSize/biggestSideLength;
        object.scale.set(scaleFactor*object.scale.x, scaleFactor*object.scale.y, scaleFactor*object.scale.z);
}

/**
 * Function to set the position of the object centre to the given position
 * @param object - the object to set the centre position of
 * @param position - the position to set the centre to
 */
export function setPositionOfCentre(object, position){
    const pos = position.clone();
    const boundingBox = new THREE.Box3().setFromObject(object);
    const center = boundingBox.getCenter(new THREE.Vector3());
    object.position.add(pos.sub(center));
}

/**
 * Function to get a random integer between min and max
 * @param min minimum value
 * @param max maximum value
 * @returns {number} random integer
 */
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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