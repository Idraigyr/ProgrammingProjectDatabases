import * as THREE from "three";
import {IAnimatedView} from "./View.js";

/**
 * Player view
 */
export class Player extends IAnimatedView{
    constructor(params) {
        super(params);
        this.boundingBox.setFromObject(this.charModel);
        this.horizontalRotation = 90;
    }

    /**
     * Load player model's animations
     * @param clips
     */
    loadAnimations(clips){
        const getAnimation =  (animName, alias) => {
            let clip = THREE.AnimationClip.findByName(clips, animName);
            this.animations[alias] =  new THREE.AnimationAction(this.mixer, clip, this.charModel);
        }
        getAnimation('CharacterArmature|Walk',"Walk");
        getAnimation('CharacterArmature|Idle',"Idle");
        getAnimation('CharacterArmature|Run',"Run");
        getAnimation('CharacterArmature|Walk',"WalkForward");
        getAnimation('CharacterArmature|Roll',"WalkBackward");
        getAnimation('CharacterArmature|Spell1',"DefaultAttack");
    }

}