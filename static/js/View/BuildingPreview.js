import {IView} from "./View.js";
import * as THREE from "three";

export class BuildingPreview extends IView{
    constructor(params) {
        super(params);
        this.timer = params.timer;
        this.particleSystem = params.particleSystem;

        //TODO: everything for view itself;
        this.charModel.traverse((o) => {
            if (o.isMesh) o.material = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
        });
        //create cloud around building
        //create particle system around building

    }

    isNotDead(deltaTime){
        if(this.timer.finished){
            if(!this.particleSystem.isNotDead(deltaTime)){
                this.cleanUp();
                return false;
            }
        }
        return true;
    }


}