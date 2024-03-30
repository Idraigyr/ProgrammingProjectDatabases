import * as THREE from "three";
import {maxZoomIn, minZoomIn} from "../configs/ControllerConfigs.js";
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
    #collisionLine;

    /**
     * Create a camera manager
     * @param params parameters
     */
    constructor(params) {
        this.camera = params.camera;
        this.#target = params.target;
        this.#offset = params.offset;
        this.#lookAt = params.lookAt;
        this.raycaster = params.raycaster;
        this.#zoom = minZoomIn;
        this.#collisionLine = new THREE.Line3(new THREE.Vector3(), new THREE.Vector3());

        //visualise camera line -- DEBUG STATEMENTS --
        // this.linepoints = [new THREE.Vector3(),new THREE.Vector3()];
        // this.line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([]), new THREE.LineBasicMaterial({color: 0xFF0000}));
        //visualise camera line -- DEBUG STATEMENTS --
    }

    /**
     * Calculate the zoom
     * @param idealOffset ideal offset
     * @param idealLookAt ideal look at
     * @returns {THREE.Vector3} the zoom
     */
    calculateZoom(idealOffset, idealLookAt){
        this.#collisionLine.start.copy(idealLookAt);
        this.#collisionLine.end.copy(idealOffset);

        const origin = new THREE.Vector3();
        const direction = new THREE.Vector3().subVectors(idealOffset,idealLookAt).normalize();

        this.#collisionLine.closestPointToPoint(this.#target.position,true,origin);

        //visualise camera line -- DEBUG STATEMENTS --
        // this.linepoints[0].copy(origin);
        // this.linepoints[1].copy(origin).add(direction);
        //visualise camera line -- DEBUG STATEMENTS --

        const hit = this.raycaster.getFirstHitWithWorld(origin, direction);

        let zoom = new THREE.Vector3().copy(idealOffset);
        //TODO: optional add manual zoom in/out functionality

        if(hit.length > 0){
            const distance = origin.distanceTo(hit[0].point);
            if(distance < minZoomIn){
                zoom.add(direction.negate().multiplyScalar(min(minZoomIn-distance, maxZoomIn)));
            }
        }
        return zoom;
    }

    //visualise camera line -- DEBUG STATEMENTS --
    // get collisionLine(){
    //     this.line.geometry.setFromPoints(this.linepoints);
    //     return this.line;
    // }
    //visualise camera line -- DEBUG STATEMENTS --

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

        this.camera.position.copy(this.calculateZoom(idealOffset,idealLookAt));
        this.camera.lookAt(idealLookAt);
        document.dispatchEvent(this.createUpdatePositionEvent());

    }

    createUpdatePositionEvent(){
        return new CustomEvent('updateCameraPosition', {detail: {camera: this.camera}})
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