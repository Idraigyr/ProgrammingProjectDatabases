import {Subject} from "../Patterns/Subject.js";
import * as THREE from "three";

export class Entity extends Subject{
    constructor(params) {
        super();
        this._position =  params?.position ?? new THREE.Vector3(0,0,0);
    }
    _createUpdatePositionEvent(){
        return new CustomEvent("updatePosition", {detail: {position: new THREE.Vector3().copy(this._position)}});
    }
    update(deltaTime){

    }

    get type(){
        if(this.constructor === Entity){
            throw new Error("cannot get type of abstract class Entity");
        }
    }
}