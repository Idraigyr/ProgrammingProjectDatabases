import * as THREE from "three";

export class RaycastController{
    /**
     * Constructs raycaster with the given parameters
     * @param params parameters (with viewManager)
     */
    constructor(params) {
        this.raycaster = new THREE.Raycaster();
        this.viewManager = params.viewManager;
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
     * Returns extracted from models intersected objects
     * @param touchableObjects list with models
     * @returns {[]} three js intersection objects
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