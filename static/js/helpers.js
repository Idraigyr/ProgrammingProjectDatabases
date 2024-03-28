import * as THREE from "three";
import {gridCellSize} from "./configs/ViewConfigs.js";

/**
 * Get the smallest number between x1 and x2
 * @param x1 first number
 * @param x2 second number
 * @returns {*} the smallest number
 */
export const min = function(x1, x2){
    return x1 < x2 ? x1 : x2;
}
/**
 * Get the largest number between x1 and x2
 * @param x1 first number
 * @param x2 second number
 * @returns {*} the largest number
 */
export const max = function(x1, x2){
    return x1 > x2 ? x1 : x2;
}

export const convertWorldToGridPosition = function (position){
    position.x = Math.floor(position.x/gridCellSize + 0.5)*gridCellSize;
    position.z = Math.floor(position.z/gridCellSize + 0.5)*gridCellSize;
}

export const convertGridToWorldPosition = function (position){
    position.x = position.x*gridCellSize;
    position.z = position.z*gridCellSize;
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
        convertGridToWorldPosition(extracted.position);
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