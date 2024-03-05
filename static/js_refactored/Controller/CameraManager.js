import * as THREE from "three";

export class CameraManager {
    #target;
    #offset;
    #lookAt;
    constructor(params) {
        this.camera = params.camera;
        this.#target = params.target;
        this.#offset = params.offset;
        this.#lookAt = params.lookAt;
    }

    zoomIn(amount){
        console.log(this.camera.getWorldDirection());
    }

    zoomOut(amount){
        console.log(this.camera.getWorldDirection());
    }

    transformVecWithTarget(vector){
        vector.applyQuaternion(this.#target.rotation);
        vector.add(this.#target.position);
        return vector;
    }

    update(deltaTime){
        let idealOffset = this.transformVecWithTarget(new THREE.Vector3().copy(this.#offset));
        const idealLookAt = this.transformVecWithTarget(new THREE.Vector3().copy(this.#lookAt));

        let vec = new THREE.Vector3().copy(this.#offset);
        while(false){ // false => conditional that checks against max zoomIn amount if camera.position.y < 0
            this.zoomIn(5);
        }

        this.camera.position.copy(idealOffset);
        this.camera.lookAt(idealLookAt);
    }

    set target(target){
        this.#target = target;
    }

}