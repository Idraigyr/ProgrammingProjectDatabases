import * as THREE from "three";

export class RaycastController{
    touchableObjects = [];
    plane;
    constructor(plane) {
        this.raycaster = new THREE.Raycaster();
        this.plane = plane;
        this.addTouchableObject(plane);
    }
    updatePosition(event){
        this.raycaster.setFromCamera(new THREE.Vector2(0,0),event.detail.camera);
    }
    addTouchableObject(object){
        this.touchableObjects.push(object);
    }
    removeTouchableObject(object){
        this.touchableObjects.splice( this.touchableObjects.indexOf( object ), 1 );
    }
    getIntersects(touchableObjects){
        return this.raycaster.intersectObjects(this.touchableObjects, false);
    }
}