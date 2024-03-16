import * as THREE from "three";

export class IView {
    constructor(params) {
        this.charModel = params?.charModel;
        this.horizontalRotation = 0;
    }
    update(deltaTime) {}
    updatePosition(event){
        if(!this.charModel) return;
        this.charModel.position.set(event.detail.position.x, event.detail.position.y,event.detail.position.z);
    }

    updateRotation(event){
        if(!this.charModel) return;
        this.charModel.rotation.setFromQuaternion(event.detail.rotation);
        this.charModel.rotateY(this.horizontalRotation * Math.PI / 360);
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