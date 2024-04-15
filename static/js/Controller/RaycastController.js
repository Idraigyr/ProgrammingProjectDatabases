import * as THREE from "three";

/**
 * Class for raycasting
 */
export class RaycastController{
    /**
     * Constructs raycaster with the given parameters
     * @param params parameters (with viewManager)
     */
    constructor(params) {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.firstHitOnly = true;
        this.viewManager = params.viewManager;
        this.collisionDetector = params.collisionDetector;
        document.addEventListener('updateCameraPosition', this.updatePosition.bind(this));
    }

    /**
     * Updates camera position of the raycaster
     * @param event event with updated camera
     */
    updatePosition(event){
        this.raycaster.setFromCamera(new THREE.Vector2(0,0),event.detail.camera);
    }

    /**
     * NYI
     * @param entities
     */
    getFirstEntityHit(entities){

    }

    /**
     * NYI
     * @param entities
     */
    getAllEntityHits(entities){

    }

    /**
     * Returns the first hit with the world
     * @param {THREE.Vector3} origin
     * @param {THREE.Vector3} direction
     * @return {*[]}
     */
    getFirstHitWithWorld(origin, direction){
        const oldRayCopy = new THREE.Ray().copy(this.raycaster.ray);
        this.raycaster.ray.set(origin,direction);
        const hit = this.raycaster.intersectObject(this.collisionDetector.collider);
        this.raycaster.ray.copy(oldRayCopy);
        return hit;
    }

    /**
     * Returns extracted from models intersected objects
     * @param touchableObjects list with models
     * @returns {*[]} three js intersection objects
     */
    getIntersects(touchableObjects){
        let extracted = []
        for (const object of touchableObjects){
            extracted.push(this.extractObject(object));
        }
        return this.raycaster.intersectObjects(extracted, true);
    }

    /**
     * Extracts three js object from custom classes
     * @param toExtract class from which you have to extract
     */
    extractObject(toExtract){
        if(toExtract.isObject3D) return toExtract;
        return toExtract.charModel;
    }
}