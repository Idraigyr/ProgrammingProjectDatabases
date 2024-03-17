import * as THREE from "three";
import {maxZoomIn, minZoomIn, minCameraY} from "../configs/ControllerConfigs.js";
import {max, min} from "../helpers.js";

/**
 * Class to manage the camera
 */
export class CameraManager {
    //TODO: convert to observer (for target position and rotation)
    #target;
    #offset;
    #lookAt;
    #zoom;

    /**
     * Create a camera manager
     * @param params parameters
     */
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

    /**
     * Calculate the zoom
     * @param idealOffset ideal offset
     * @param idealLookAt ideal look at
     * @param zoomIn zoom in
     * @returns {Vector3} the zoom
     */
    calculateZoom(idealOffset, idealLookAt, zoomIn){
        let vec = new THREE.Vector3().copy(idealOffset);
        let vec2 = new THREE.Vector3().copy(idealLookAt);
        vec2.multiplyScalar(-1);
        vec.add(vec2);
        vec.normalize();
        vec.multiplyScalar(max(maxZoomIn, min(minZoomIn, zoomIn)));
        return vec;
    }

    /**
     * Zoom in the camera
     * @param amount amount to zoom in
     */
    zoomIn(amount){
        this.#zoom = max(maxZoomIn, min(minZoomIn, this.#zoom + amount));
    }

    /**
     * Transform a vector with the target's position and rotation
     * @param vector vector to transform
     * @returns {*} the transformed vector
     */
    transformVecWithTarget(vector){
        vector.applyQuaternion(this.#target.rotation);
        vector.add(this.#target.position);
        return vector;
    }

    /**
     * Update the camera configurations (e.g. position, zoom, look at, etc.)
     * @param deltaTime time since last update
     */
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
        let camera = this.camera;
        const customEvent = new CustomEvent('updateCameraPosition', { detail: { camera } });
        document.dispatchEvent(customEvent);

    }

    /**
     * Set the target for the camera
     * @param target new target
     */
    set target(target){
        this.#target = target;
    }

    /**
     * Get the target for the camera
     * @returns {*} the target
     */
    get target(){
        return this.#target;
    }

}