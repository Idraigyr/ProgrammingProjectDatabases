import * as THREE from "three";

export class RaycastController{
    constructor(params) {
        this.raycaster = new THREE.Raycaster();
    }
    updatePosition(event){
        this.raycaster.setFromCamera(new THREE.Vector2(0,0),event.detail.camera);
    }
    getIntersects(touchableObjects){
        return this.raycaster.intersectObjects(touchableObjects, false);
    }
}