import * as THREE from "three";
import {Entity} from "../Entity.js";
import {pushCollidedObjects} from "../../../helpers.js";
//abstract class
/**
 * Abstract class for all characters in the game
 */
export class Character extends Entity{
    #rotation;

    /**
     * Constructor for the Character
     * @param {Object} params
     * @property {number} phi - the current horizontal rotation in radians
     * @param params
     */
    constructor(params) {
        super(params);
        if(this.constructor === Character){
            throw new Error("cannot instantiate abstract class Character");
        }
        this.phi = 0; // current horizontal rotation
        this.theta = 0; // current vertical rotation
        this.#rotation = new THREE.Quaternion(); // total rotation as a Quaternion
        this.velocity = new THREE.Vector3();
        this.onGround = true;
        this.onCollidable = false;
        this.hit = false;
        this.fsm = null;
        this.health = params?.health ?? 100;
        this.maxHealth = params?.health ?? 100;
        this.height = params.height;
        this.segment = new THREE.Line3();
        this.spawnPoint = new THREE.Vector3().copy(params.spawnPoint);
        this.setSegmentFromPosition(this.spawnPoint);
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
}