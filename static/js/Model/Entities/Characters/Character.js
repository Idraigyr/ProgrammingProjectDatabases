import * as THREE from "three";
import {Entity} from "../Entity.js";
import {pushCollidedObjects} from "../../../helpers.js";
//abstract class
/**
 * Abstract class for all characters in the game
 */
export class Character extends Entity{
    #rotation;
    #fsm;

    /**
     * Constructor for the Character
     * @param {Object} params
     * @property {number} phi - the current horizontal rotation in radians
     * @param params
     */
    constructor(params) {
        super(params);
        this.phi = 0; // current horizontal rotation
        this.theta = 0; // current vertical rotation
        this.#rotation = new THREE.Quaternion(); // total rotation as a Quaternion
        this.velocity = new THREE.Vector3();
        this.onGround = true;
        this.onCollidable = false;
        this.hit = false;
        this.#fsm = null;
        this.health = params?.health ?? 100;
        this.maxHealth = params?.health ?? 100;
        this.height = params.height;
        this.segment = new THREE.Line3();
        this.spawnPoint = new THREE.Vector3().copy(params.spawnPoint);
        this.setSegmentFromPosition(this.spawnPoint);

        this.updateEvent = this.forwardStateUpdate.bind(this);
    }

    /**
     * Set the id of the entity
     * @param {JSON} data - entire JSON object from db
     */
    setId(data){
        this.id = data.entity.player_id;
    }

    /**
     * Set the finite state machine of the character and add an event listener for state updates
     * @param {FiniteStateMachine} fsm
     */
    set fsm(fsm){
        if(this.#fsm){
            this.#fsm.removeEventListener("updatedState", this.updateEvent);
        }
        this.#fsm = fsm;
        this.#fsm.addEventListener("updatedState", this.updateEvent);
    }

    /**
     * Get the finite state machine of the character
     * @return {FiniteStateMachine}
     */
    get fsm(){
        return this.#fsm;
    }

    /**
     * Create a CustomEvent for dispatching the current (animation) state of the character
     * @param event
     * @return {CustomEvent<unknown>}
     */
    createUpdatedStateEvent(event){
        return new CustomEvent("updatedState", {detail: event.detail});
    }

    /**
     *
     * @param event
     */
    forwardStateUpdate(event){
        this.dispatchEvent(this.createUpdatedStateEvent(event));
    }

    /**
     * Get the quaternion representing the rotation of the character
     * @returns {Quaternion} the rotation of the character
     */
    get quatFromHorizontalRotation(){
        const qHorizontal = new THREE.Quaternion();
        qHorizontal.setFromAxisAngle(new THREE.Vector3(0,1,0), this.phi);
        return qHorizontal;
    }

    setSegmentFromPosition(vec3){
        this.segment.start.copy(vec3);
        this.segment.end.copy(vec3);
        this.segment.start.y += this.height - this.radius;
        this.segment.end.y +=  this.radius;
    }

    onCharacterCollision(deltaTime, other, thisBox, otherBox){
        pushCollidedObjects(thisBox, otherBox, this.velocity, other.velocity, 1, 20, deltaTime);
    }

    /**
     * Create a CustomEvent for updating the rotation of the character
     * @returns {CustomEvent<{rotation: Quaternion}>} the CustomEvent
     */
    createUpdateRotationEvent(){
        return new CustomEvent("updateRotation", {detail: {rotation: new THREE.Quaternion().copy(this.quatFromHorizontalRotation)}});
    }

    createHealthUpdateEvent(){
        return new CustomEvent("updateHealth", {detail: {current: this.health, total: this.maxHealth}});
    }

    /**
     * Send a CustomEvent for updating the position of the character
     * @param vector {Vector3} the new position of the character
     */
    set position(vector){
        this._position.copy(vector);
        this.setSegmentFromPosition(this._position);
        //update view
        this.dispatchEvent(this._createUpdatePositionEvent());
    }

    /**
     * Get position of the character
     * @returns {*|Vector3} the position of the character
     */
    get position(){
        return this._position;
    }

    /**
     * Set the rotation of the character
     * @param quaternion {Quaternion} the new rotation of the character
     */
    set rotation(quaternion){
        this.#rotation = quaternion;
        //update view
        this.dispatchEvent(this.createUpdateRotationEvent());
    }

    /**
     * Get the rotation of the character
     * @returns {*} the rotation of the character
     */
    get rotation(){
        return this.#rotation;
    }

    get verticalVelocity(){
        return new THREE.Vector3(0, this.velocity.y, 0);
    }

    /**
     * Get the type of the character
     */
    get type(){
        // throw new Error("cannot get type of abstract class Character");
        return "character";
    }

    /**
     * Take damage
     */
    takeDamage(damage){
        console.log("taking damage");
        this.health -= damage;
        this.dispatchEvent(this.createHealthUpdateEvent());
        if(this.health <= 0){
            this.health = 0;
            this.dies();
        }
    }

    dies(){
        throw new Error("cannot call abstract method Character.dies");
    }
}