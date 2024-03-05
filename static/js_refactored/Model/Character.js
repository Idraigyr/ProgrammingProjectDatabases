import {Subject} from "../Patterns/Subject";
import * as THREE from "three";
//abstract class
export class Character extends Subject{
    #position;
    #rotation;
    constructor() {
        super();
        if(this.constructor === Character){
            throw new Error("cannot instantiate abstract class Character");
        }
        this.#position = new THREE.Vector3(0,0,0);
        this.phi = 0; // current horizontal rotation
        this.theta = 0; // current vertical rotation
        this.#rotation = new THREE.Quaternion(); // total rotation as a Quaternion
        this.fsm = null;
        this.updatePosition = new CustomEvent("updatePosition", {detail: {position: new THREE.Vector3().copy(this.#position)}});
        this.updateRotation = new CustomEvent("updateRotation", {detail: {rotation: new THREE.Quaternion().copy(this.#rotation)}});
    }
    set position(vector){
        this.#position = vector;
        //update view
        this.dispatchEvent(this.updatePosition);
    }

    get position(){
        return this.#position;
    }

    set rotation(quaternion){
        this.#rotation = quaternion;
        //update view
        this.dispatchEvent(this.updateRotation);
    }
}