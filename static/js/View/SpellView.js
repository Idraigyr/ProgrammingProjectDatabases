import {IView} from "./View.js";
import * as THREE from "three";
import {ParticleSystem} from "./ParticleSystem.js";

/**
 * Fireball view
 */
export class Fireball extends IView{
    constructor(params) {
        super(params);
        this.particleSystem = new ParticleSystem(params);

        const geo = new THREE.SphereGeometry(0.1);
        const mat = new THREE.MeshPhongMaterial({color: 0xFF6C00 });
        this.charModel = new THREE.Mesh(geo, mat);
    }

    /**
     * Update fireball position
     * @param event event with position
     */
    updatePosition(event){
        if(!this.charModel) return;
        this.charModel.position.copy(event.detail.position);
        this.particleSystem.position.copy(event.detail.position);
    }
}

export class RitualView extends IView{

}