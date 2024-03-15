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
        // TODO: problem of the raycaster: it can only be applied on threejs objects
        return this.raycaster.intersectObjects(touchableObjects, true);
    }
}