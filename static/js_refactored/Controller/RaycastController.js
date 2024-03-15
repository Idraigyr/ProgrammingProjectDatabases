import * as THREE from "three";

export class RaycastController{
    constructor(params) {
        this.raycaster = new THREE.Raycaster();
        this.viewManager = params.viewManager;
    }
    updatePosition(event){
        this.raycaster.setFromCamera(new THREE.Vector2(0,0),event.detail.camera);
    }
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