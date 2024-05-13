import * as THREE from "three";
import {displayViewBoxHelper} from "../configs/ViewConfigs.js";

/**
 * View base class
 */
export class IView {
    constructor(params) {
        this.position = params?.position ?? new THREE.Vector3(0,0,0);
        this.charModel = params?.charModel  ?? null;
        if(this.charModel) this.charModel.position.copy(this.position);
        this.boundingBox = new THREE.Box3();
        //only for visualisation
        this.boxHelper = null;
        if(displayViewBoxHelper){
            this.boxHelper = new THREE.Box3Helper(this.boundingBox, 0xFFF700);
        }
        this.horizontalRotation = params?.horizontalRotation ?? 0;
        this.staysAlive = false;
        this.hasUpdates = false;
    }

    /**
     * First update of the view
     */
    firstUpdate() {
        try {
            this.updatePosition({detail: {position: params.position}});
            this.updateRotation({detail: {rotation: new THREE.Quaternion()}});
        } catch (err){
            console.log(err);
        }
    }

    /**
     * Update bounding box
     */
    updateBoundingBox(){
        this.boundingBox.setFromObject(this.charModel, true);
    }

    /**
     * Clean up the view for deletion
     */
    dispose() {
        try {
            this.boxHelper.parent.remove(this.boxHelper);
        } catch (err){
            console.log("BoxHelper not added to scene.");
        }
        this.charModel.parent.remove(this.charModel);
    }

    /**
     * Update the view
     * @param deltaTime - time since last update
     * @param camera - camera to update view
     */
    update(deltaTime, camera) {}

    /**
     * Update position of the view
     * @param event - event with position
     */
    updatePosition(event){
        if(!this.charModel) return;
        const delta = new THREE.Vector3().subVectors(event.detail.position, this.position);
        this.position.copy(event.detail.position);
        this.charModel.position.copy(this.position);
        this.boundingBox.translate(delta);
    }

    /**
     * Update rotation of the view
     * @param event - event with rotation
     */
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
        this.hasUpdates = true;
        this.mixer = new THREE.AnimationMixer(params.charModel);
        this.animations = {};
    }

    /**
     * put animations in the animations property, only use in loadAnimations
     * @param clips - clips to search for animation
     * @param animName - name of the animation (inside the model file)
     * @param alias - alias for the animation which will be used to reference it within the code
     * @protected
     */
    _getAnimation(clips, animName, alias){
        let clip = THREE.AnimationClip.findByName(clips, animName);
        this.animations[alias] =  new THREE.AnimationAction(this.mixer, clip, this.charModel);
    }

    /**
     * Update animations
     * @param deltaTime time since last update
     * @param camera camera to update view
     */
    update(deltaTime, camera) {
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