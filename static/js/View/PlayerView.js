import * as THREE from "three";
import {CharacterView} from "./Characters/CharacterView.js";

/**
 * Player view
 */
export class Player extends CharacterView{
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
        this._getAnimation(clips, 'CharacterArmature|Walk',"Walk");
        this._getAnimation(clips, 'CharacterArmature|Idle',"Idle");
        this._getAnimation(clips, 'CharacterArmature|Run',"Run");
        this._getAnimation(clips, 'CharacterArmature|Walk',"WalkForward");
        this._getAnimation(clips, 'CharacterArmature|Roll',"WalkBackward");
        this._getAnimation(clips, 'CharacterArmature|Spell1',"DefaultAttack");
        this._getAnimation(clips, 'CharacterArmature|PickUp', 'Eating')
    }

    /**
     * hides the player model (used when opponent dies)
     */

    hide(){
        this.charModel.visible = false;
    }

    /**
     * shows the player model (used when opponent respawns)SS
     */
    show(){
        this.charModel.visible = true;
    }

}