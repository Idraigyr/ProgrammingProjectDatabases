import {Subject} from "../Patterns/Subject.js";
import * as THREE from "three";

/**
 * @class Entity - abstract class for all entities in the game
 */
export class Entity extends Subject{
    /**
     * initialises Entity
     * @param {{position: THREE.Vector3, radius: number} | {}} params - optional
     */
    constructor(params) {
        super();
        this.radius = params?.radius ?? 0.5;
        this._position =  params?.position ?? new THREE.Vector3(0,0,0);
    }

    /**
     * Create an event that position of entity has changed
     * @returns {CustomEvent<{position: THREE.Vector3}>} - event with new position
     * @protected - should not be called from outside the class and its inheritors
     */
    _createUpdatePositionEvent(){
        return new CustomEvent("updatePosition", {detail: {position: new THREE.Vector3().copy(this._position)}});
    }
    /**
     * NYI
     */
    update(deltaTime){

    }

    /**
     * creates a delete event, tells viewManager to delete view
     * @returns {CustomEvent<{model: this}>}
     */
    createDeleteEvent(){
        return new CustomEvent("delete", {detail: {model: this}});
    }

    /**
     * Get type of entity
     */
    get type(){
        if(this.constructor === Entity){
            throw new Error("cannot get type of abstract class Entity");
        }
        throw new Error("cannot get type of abstract class Entity");
    }
}