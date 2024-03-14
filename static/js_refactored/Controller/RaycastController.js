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
        return this.raycaster.intersectObjects(touchableObjects, false);
    }

    updateBuildSpell(event){
        let closedCollided = this.getIntersects(this.viewManager.ritualTouchables)?.[0];
        if(closedCollided){
            
        }
    }
}