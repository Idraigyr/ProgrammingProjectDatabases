import * as THREE from "three";
import {Subject} from "../Patterns/Subject";

export class Island extends Subject{
    #phi = 0;
    #theta = 0;
    constructor() {
        super();
        this.position = new THREE.Vector3(0,0,0);
        this.rotation = new THREE.Quaternion();
    }
}