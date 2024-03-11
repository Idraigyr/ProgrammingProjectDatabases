import * as THREE from "three";
import {maxZoomIn, minZoomIn, minCameraY} from "../configs/ControllerConfigs.js";
import {max, min} from "../helpers.js";

export class CameraManager {
    //TODO: convert to observer (for target position and rotation)
    #target;
    #offset;
    #lookAt;
    #zoom;
    constructor(params) {
        this.camera = params.camera;
        this.#target = params.target;
        this.#offset = params.offset;
        this.#lookAt = params.lookAt;
        this.#zoom = minZoomIn;
        //there is no zoomOut functionality so not functional
        // document.addEventListener("keydown", (e) => {
        //     if(e.code === "KeyO"){
        //         this.zoomIn(0.2);
        //     } else if (e.code === "KeyP"){
        //         this.zoomIn(-0.2);
        //     }
        // });
    }

    calculateZoom(idealOffset, idealLookAt, zoomIn){
        let vec = new THREE.Vector3().copy(idealOffset);
        let vec2 = new THREE.Vector3().copy(idealLookAt);
        vec2.multiplyScalar(-1);
        vec.add(vec2);
        vec.normalize();
        vec.multiplyScalar(max(maxZoomIn, min(minZoomIn, zoomIn)));
        return vec;
    }
    zoomIn(amount){
        this.#zoom = max(maxZoomIn, min(minZoomIn, this.#zoom + amount));
    }

    transformVecWithTarget(vector){
        vector.applyQuaternion(this.#target.rotation);
        vector.add(this.#target.position);
        return vector;
    }

    update(deltaTime){
        let idealOffset = this.transformVecWithTarget(new THREE.Vector3().copy(this.#offset));
        const idealLookAt = this.transformVecWithTarget(new THREE.Vector3().copy(this.#lookAt));
        let zoom = this.calculateZoom(idealOffset, idealLookAt, this.#zoom);
        let zoomIn = this.#zoom;

        let copy = idealOffset;

        //don't uncomment; freezes screen;
        //copy = copy.add(zoom);
        if(copy.y < minCameraY){
            while(copy.y < minCameraY){
                copy = new THREE.Vector3().copy(idealOffset);
                zoomIn -= 0.1;
                zoom = this.calculateZoom(idealOffset, idealLookAt, zoomIn);
                copy = copy.add(zoom);
            }
        }

        this.camera.position.copy(copy);
        this.camera.lookAt(idealLookAt);
    }

    set target(target){
        this.#target = target;
    }

    get target(){
        return this.#target;
    }

}