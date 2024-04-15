import {IAnimatedView} from "../View.js";

export class Minion extends IAnimatedView{
    constructor(params) {
        super(params);
    }

    /**
     * Load Minion model's animations
     * @param clips
     */
    loadAnimations(clips){
        this._getAnimation(clips, 'Idle',"Idle");
        this._getAnimation(clips, 'Walking_A',"WalkForward");
        this._getAnimation(clips, 'Walking_Backwards',"WalkBackward");
        this._getAnimation(clips, 'Running_A',"Run");
        this._getAnimation(clips, 'Hit_A',"DefaultAttack");
        this._getAnimation(clips, 'Jump_Full_Short',"Jump");
    }
}