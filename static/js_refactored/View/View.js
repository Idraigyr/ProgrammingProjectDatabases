import * as THREE from "three";

/**
 * View base class
 */
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

/**
 * Animated view pure virtual base class
 */
export class IAnimatedView extends IView{
    constructor(params) {
        super(params);
        this.animated = true;
        this.mixer = new THREE.AnimationMixer(params.charModel);
        this.animations = {};
    }

    /**
     * Update animations
     * @param deltaTime time since last update
     */
    update(deltaTime) {
        if(this.mixer) this.mixer.update(deltaTime);
    }

    /**
     * Load animations
     * @param clips clips to load
     */
    loadAnimations(clips){
        throw new Error("pure virtual function called (IAnimatedView.loadAnimations)");
    }
}