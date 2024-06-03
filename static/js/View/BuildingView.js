import {IView} from "./View.js";
import * as THREE from "three";

/**
 * Building view base class
 */
export class Building extends IView{
    constructor(params) {
        super(params);
        this.boundingBox.setFromObject(this.charModel);
        this.rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
    }

    /**
     * Update position of the building
     * @param event event with position
     */
    updatePosition(event) {
        super.updatePosition(event);
        //normally matrixWorld is updated every frame.
        // we need to update it extra here because buildings and islands will be moved on loading of a multiplayer game,
        // we can't wait to update the matrixWorld because generateCollider depends on it
        this.charModel.updateMatrixWorld();
    }

    /**
     * Update rotation of the building
     * @param event event with rotation
     */
    updateRotation(event) {
        super.updateRotation(event);
        //check updatePosition for explanation
        this.charModel.updateMatrixWorld();
    }

    /**
     * Update the building's ready state
     * @param event event with ready state
     */
    updateReady(event) {
        if(event.detail.ready){
            this.charModel.traverse (function (child) {
                if (child instanceof THREE.Mesh) {
                    if(child.originalMaterial !== undefined) {
                        // Save the original color
                        child.material = child.originalMaterial;
                    }
                }
            });
        } else {
            const greenMaterial = this.rollOverMaterial;
            // Make charModel green and set opacity to 0.5
            this.charModel.traverse (function (child) {
                if (child instanceof THREE.Mesh) {
                    // Save the original color
                    if (child.material !== greenMaterial) child.originalMaterial = child.material;
                    // Make it green
                    child.material = greenMaterial;
                }
            });
        }
    }
}