import {IView} from "./View.js";
import * as THREE from "three";
import {ParticleSystem} from "./ParticleSystem.js";

/**
 * Building preview view
 */
export class BuildingPreview extends IView{
    constructor(params) {
        super(params);
        this.timerModel = params.timerModel;
        this.hasUpdates = true;
        // this.particleSystem = new ParticleSystem(params);

        //TODO: everything for view itself;
        this.charModel.traverse((o) => {
            if (o.isMesh) o.material = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
        });
        //create cloud around building
        //create particle system around building

    }

    hide(){
        this.charModel.visible = false;
    }

    show(){
        this.charModel.visible = true;
    }

    /**
     * Check if building preview is not dead
     * @param deltaTime time passed since last update
     * @param camera camera to update view
     * @returns {boolean} true if building preview is not dead
     */
    isNotDead(deltaTime, camera){
        if(!this.timerModel.isNotDead(deltaTime, camera)){
            this.dispose();
            return false;
        }
        return true;
    }

    update(deltaTime, camera) {
        super.update(deltaTime, camera);
    }


}