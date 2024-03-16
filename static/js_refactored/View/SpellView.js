import {IView} from "./View.js";
import * as THREE from "three";

export class Fireball extends IView{
    constructor() {
        super();
    }
    initModel(){
        const geo = new THREE.SphereGeometry(1);
        const mat = new THREE.MeshPhongMaterial({color: 0xFF6C00 });
        this.charModel = new THREE.Mesh(geo, mat);
    }
    updatePosition(event){
        if(!this.charModel) return;
        this.charModel.position.set(event.detail.position.x, event.detail.position.y,event.detail.position.z);
    }
}

export class RitualView extends IView{

}