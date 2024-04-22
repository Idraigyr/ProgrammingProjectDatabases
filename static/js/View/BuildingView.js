import {IView} from "./View.js";

/**
 * Building view base class
 */
export class Building extends IView{
    constructor(params) {
        super(params);
        this.boundingBox.setFromObject(this.charModel);
    }

    updatePosition(event) {
        super.updatePosition(event);
        //normally matrixWorld is updated every frame.
        // we need to update it extra here because buildings and islands will be moved on loading of a multiplayer game,
        // we can't wait to update the matrixWorld because generateCollider depends on it
        this.charModel.updateMatrixWorld();
    }

    updateRotation(event) {
        super.updateRotation(event);
        //check updatePosition for explanation
        this.charModel.updateMatrixWorld();
    }
}