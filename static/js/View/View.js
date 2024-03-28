import * as THREE from "three";

/**
 * View base class
 */
export class IView {
    constructor(params) {
        this.position = params?.position ?? new THREE.Vector3(0,0,0);
        this.charModel = params?.charModel;
        this.boundingBox = new THREE.Box3();
        //only for visualisation
        this.boxHelper = new THREE.Box3Helper(this.boundingBox, 0xFFF700);
        this.boxHelper.visible = true;
        this.horizontalRotation = 0;

        try {
            this.updatePosition({detail: {position: params.position}});
        } catch (err){
        }
    }
    update(deltaTime) {}

    setBoundingBox(){
        let center = new THREE.Vector3().copy(this.charModel.position);
        let size = new THREE.Vector3();
        this.boundingBox.getSize(size);
        center.y += size.y/2;
        this.boundingBox.setFromCenterAndSize(center,size);
    }
    updatePosition(event){
        if(!this.charModel) return;
        this.position.copy(event.detail.position);
        this.charModel.position.copy(this.position);
        this.setBoundingBox();
    }

    updateRotation(event){
        if(!this.charModel) return;
        this.charModel.setRotationFromQuaternion(event.detail.rotation);
        this.charModel.rotateY(this.horizontalRotation * Math.PI / 360);
        //this.boundingBox.setFromObject(this.charModel, true);
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