import * as THREE from "three";
import {Vector3} from "three";

export class IView {
    constructor(params) {
        this.position = params?.position ?? new THREE.Vector3(0,0,0);
        this.charModel = params?.charModel;
        this.boundingBox = new THREE.Box3();
        //only for visualisation
        this.boxHelper = new THREE.Box3Helper(this.boundingBox, 0xFFF700);
        this.horizontalRotation = 0;
    }
    update(deltaTime) {}
    updatePosition(event){
        if(!this.charModel) return;
        this.position.copy(event.detail.position);
        this.charModel.position.copy(this.position);
        let center = new THREE.Vector3().copy(this.charModel.position);
        let size = new THREE.Vector3();
        this.boundingBox.getSize(size);
        center.y += size.y/2;
        this.boundingBox.setFromCenterAndSize(center,size);
    }

    updateRotation(event){
        if(!this.charModel) return;
        this.charModel.rotation.setFromQuaternion(event.detail.rotation);
        this.charModel.rotateY(this.horizontalRotation * Math.PI / 360);
        //this.boundingBox.setFromObject(this.charModel, true);
    }
}

export class IAnimatedView extends IView{
    constructor(params) {
        super(params);
        this.animated = true;
        this.mixer = new THREE.AnimationMixer(params.charModel);
        this.animations = {};
    }
    update(deltaTime) {
        if(this.mixer) this.mixer.update(deltaTime);
    }
    loadAnimations(clips){
        throw new Error("pure virtual function called (IAnimatedView.loadAnimations)");
    }
}