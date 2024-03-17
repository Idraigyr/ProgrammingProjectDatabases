import {Subject} from "../Patterns/Subject.js";
import * as THREE from "three";

/**
 * @class Entity - abstract class for all entities in the game
 */
export class Entity extends Subject{
    constructor(params) {
        super();
        this._position =  params?.position ?? new THREE.Vector3(0,0,0);
    }

    /**
     * Create an event that position of entity has changed
     * @returns {CustomEvent<{position: Vector3}>} - event with new position
     * @private - should not be called from outside the class and its inheritors
     */
    _createUpdatePositionEvent(){
        return new CustomEvent("updatePosition", {detail: {position: new THREE.Vector3().copy(this._position)}});
    }
    update(deltaTime){

    }

    /**
     * Get type of entity
     */
    get type(){
        if(this.constructor === Entity){
            throw new Error("cannot get type of abstract class Entity");
        }
    }
}