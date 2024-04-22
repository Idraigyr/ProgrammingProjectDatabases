import {Subject} from "../Patterns/Subject.js";
import * as THREE from "three";

/**
 * @class Entity - abstract class for all entities in the game
 */
export class Entity extends Subject{
    /**
     * initialises Entity
     * @param {{position: THREE.Vector3, radius: number, team: number} | {}} params - optional
     */
    constructor(params) {
        super(params);
        this.radius = params?.radius ?? 0.5;
        this._position =  params?.position?.clone() ?? new THREE.Vector3(0,0,0);
        this.team = params?.team ?? 0;
    }

    /**
     * Set the id of the entity
     * @param {JSON} data - entire JSON object from db
     */
    setId(data){
        throw new Error("Cannot set id of abstract class Entity");
    }

    /**
     * Set the id of the entity
     * @param {UserInfo} userInfo - all the information about the user
     * @param {THREE.Vector3} islandPosition - world position of the island
     * @return {JSON} data - entire stringified JSON object which db can accept
     */
    formatPOSTData(userInfo, islandPosition){
        throw new Error("Cannot set id of abstract class Entity");
    }

    /**
     * Create an event that position of entity has changed
     * @returns {CustomEvent<{position: THREE.Vector3}>} - event with new position
     * @protected - should not be called from outside the class and its inheritors
     */
    _createUpdatePositionEvent(){
        return new CustomEvent("updatePosition", {detail: {position: new THREE.Vector3().copy(this._position)}});
    }
    _createUpdateMinYEvent(y){
        return new CustomEvent("updateMinY", {detail: {minY: y}});
    }
    /**
     * NYI
     */
    update(deltaTime){

    }

    set position(vector){
        this._position.copy(vector);
        this.dispatchEvent(this._createUpdatePositionEvent());
    }

    get position(){
        return this._position.clone();
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
        throw new Error("cannot get type of abstract class Entity");
    }

    /**
     * Get database type of entity
     */
    get dbType(){
        throw new Error("cannot get type of abstract class Entity");
    }

    /**
     * Set minimum y value of the entity bounding box
     * @param y - new minimum y value
     */
    setMinimumY(y){
        this._position.y = y;
        this.dispatchEvent(this._createUpdateMinYEvent(y));
    }
}