import * as THREE from "three";
import {Entity} from "./Entity.js";
//abstract class
export class Character extends Entity{
    #rotation;
    constructor() {
        super();
        if(this.constructor === Character){
            throw new Error("cannot instantiate abstract class Character");
        }
        this.phi = 0; // current horizontal rotation
        this.theta = 0; // current vertical rotation
        this.#rotation = new THREE.Quaternion(); // total rotation as a Quaternion
        this.fsm = null;
    }

    get quatFromHorizontalRotation(){
        const qHorizontal = new THREE.Quaternion();
        qHorizontal.setFromAxisAngle(new THREE.Vector3(0,1,0), this.phi);
        return qHorizontal;
    }

    createUpdateRotationEvent(){
        return new CustomEvent("updateRotation", {detail: {rotation: new THREE.Quaternion().copy(this.quatFromHorizontalRotation)}});
    }
    set position(vector){
        this._position = vector;
        //update view
        this.dispatchEvent(this._createUpdatePositionEvent());
    }

    get position(){
        return this._position;
    }

    set rotation(quaternion){
        this.#rotation = quaternion;
        //update view
        this.dispatchEvent(this.createUpdateRotationEvent());
    }

    get rotation(){
        return this.#rotation;
    }
}