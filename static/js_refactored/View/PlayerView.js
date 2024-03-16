import * as THREE from "three";
import {IAnimatedView} from "./View.js";

export class Player extends IAnimatedView{
    constructor(params) {
        super(params);
        this.horizontalRotation = 180;
    }

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