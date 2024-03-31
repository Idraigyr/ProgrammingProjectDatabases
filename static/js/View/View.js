import * as THREE from "three";

/**
 * View base class
 */
export class IView {
    constructor(params) {
        this.position = params?.position ?? new THREE.Vector3(0,0,0);
        this.charModel = params?.charModel;
        if(this.charModel) this.charModel.position.copy(this.position);
        this.boundingBox = new THREE.Box3();
        //only for visualisation
        this.boxHelper = new THREE.Box3Helper(this.boundingBox, 0xFFF700);
        this.boxHelper.visible = true;
        this.horizontalRotation = params?.horizontalRotation ?? 0;
        this.staysAlive = false;
    }
    firstUpdate() {
        try {
            this.updatePosition({detail: {position: params.position}});
            this.updateRotation({detail: {rotation: new THREE.Quaternion()}});
        } catch (err){
            console.log(err);
        }
    }

    cleanUp() {
        try {
            this.boxHelper.parent.remove(this.boxHelper);
        } catch (err){
            console.log("BoxHelper not added to scene.");
        }
        this.charModel.parent.remove(this.charModel);
    }
    update(deltaTime) {}

    updatePosition(event){
        if(!this.charModel) return;
        const delta = new THREE.Vector3().subVectors(event.detail.position, this.position);
        this.position.copy(event.detail.position);
        this.charModel.position.copy(this.position);
        this.boundingBox.translate(delta);
    }

    updateRotation(event){
        if(!this.charModel) return;
        this.charModel.setRotationFromQuaternion(event.detail.rotation);
        this.charModel.rotateY(this.horizontalRotation * Math.PI / 180);
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