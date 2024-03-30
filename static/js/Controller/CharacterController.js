import {Subject} from "../Patterns/Subject.js";
import {
    horizontalSensitivity,
    movementSpeed,
    sprintMultiplier,
    gravity,
    verticalSensitivity,
    spellCastMovementSpeed,
    jumpHeight
} from "../configs/ControllerConfigs.js";
import * as THREE from "three";
import {max, min} from "../helpers.js";
import {Factory} from "./Factory.js";
import {BuildSpell, HitScanSpell, InstantSpell, EntitySpell} from "../Model/Spell.js";
import {BaseCharAttackState} from "../Model/States/CharacterStates.js";

/**
 * Class to manage the character and its actions
 */
export class CharacterController extends Subject{
    _character;
    #inputManager;

    /**
     * adds a listener to inputManager mousedown event
     * @param {{Character: Wizard, InputManager: InputManager}} params
     */
    constructor(params) {
        super();
        this._character = params.Character;
        this.tempPosition = this._character.position.clone();
        this.collisionDetector = params.collisionDetector;
        this.#inputManager = params.InputManager;
        this.#inputManager.addMouseDownListener(this.onClickEvent.bind(this));

        this.tempTemp = new THREE.Vector3();
    }

    /**
     * Update the rotation of the character
     * @param event event
     */
    updateRotation(event){
        const {movementX, movementY} = event;
        const rotateHorizontal = (movementX * horizontalSensitivity) * (Math.PI/360);
        const rotateVertical = (movementY  * verticalSensitivity) *  (Math.PI/360);
        this._character.phi -= rotateHorizontal;
        this._character.theta = THREE.MathUtils.clamp(this._character.theta - rotateVertical, -Math.PI/3, Math.PI /3);

        const qHorizontal = this.quatFromHorizontalRotation;
        const qVertical = new THREE.Quaternion();
        qVertical.setFromAxisAngle(new THREE.Vector3(0,0,1),this._character.theta);

        let q = new THREE.Quaternion();
        q.multiply(qHorizontal);
        q.multiply(qVertical);

        this._character.rotation = q;
    }

    /**
     * returns horizontal rotation as a quaternion
     * @returns {THREE.Quaternion}
     */
    get quatFromHorizontalRotation(){
        const qHorizontal = new THREE.Quaternion();
        qHorizontal.setFromAxisAngle(new THREE.Vector3(0,1,0), this._character.phi);
        return qHorizontal;
    }

    /**
     * Handle the click event
     * @param event event
     */
    onClickEvent(event){ //TODO: move to SpellCaster class
        // RightClick
        if (event.which === 3 || event.button === 2) {
            if (this._character.getCurrentSpell() instanceof BuildSpell) {
                const customEvent = new CustomEvent('turnPreviewSpell', { detail: {} });
                document.dispatchEvent(customEvent);
            }
        } // TODO: also for left click to place the buildings?
    }


    updatePhysics(deltaTime){
        //TODO: this is necessary to prevent falling through ground, find out why and remove this
        //const correctedDeltaTime = min(deltaTime, 0.1);
        this.tempTemp.copy(this.tempPosition);

        if ( this._character.onGround ) {
                this._character.velocity.y = deltaTime * gravity;
        } else {
            this._character.velocity.y += deltaTime * gravity;
        }

        this.tempPosition.addScaledVector( this._character.velocity, deltaTime );

        let deltaVector = this.collisionDetector.adjustPlayerPosition(this._character, this.tempPosition, deltaTime);

        if ( ! this._character.onGround ) {
            deltaVector.normalize();
            this._character.velocity.addScaledVector( deltaVector, - deltaVector.dot( this._character.velocity ) );
        } else {
            this._character.velocity.set( 0, 0, 0 );
        }

        if ( this._character.position.y < - 50 ) {
            //respawn
            this._character.velocity.set(0,0,0);
            this._character.position = this._character.spawnPoint;
            this.tempPosition.copy(this._character.spawnPoint);
        } else {
            this._character.position = this.tempPosition;
        }
    }

    /**
     * Update the character (e.g. state, position, spells, etc.)
     * @param deltaTime
     */
    update(deltaTime) {
        if (!this._character.fsm.currentState || this.#inputManager.blockedInput) {
            return;
        }

        this._character.currentSpell = this.#inputManager.keys.spellSlot - 1;
        this._character.fsm.updateState(deltaTime, this.#inputManager);

        if (this._character.fsm.currentState.movementPossible) {

            if(this.#inputManager.keys.up && this._character.onGround) {
                this._character.velocity.y = jumpHeight;
                this._character.onGround = false;
            }

            const qHorizontal = this.quatFromHorizontalRotation;

            let movement = new THREE.Vector3(1, 0, 0);
            let strafe = new THREE.Vector3(0, 0, 1);
            movement.applyQuaternion(qHorizontal);
            strafe.applyQuaternion(qHorizontal);

            let forwardScalar = 0;
            forwardScalar += this.#inputManager.keys.forward ? 1 : 0;
            forwardScalar -= this.#inputManager.keys.backward ? 1 : 0;

            let strafeScalar = 0;

            strafeScalar += this.#inputManager.keys.right ? 1 : 0;
            strafeScalar -= this.#inputManager.keys.left ? 1 : 0;

            movement.multiplyScalar(forwardScalar);
            strafe.multiplyScalar(strafeScalar);

            movement.add(strafe);
            movement.normalize();

            let speedMultiplier = 0;
            //TODO: keep momentum when in the air
            if(this._character.fsm.currentState instanceof BaseCharAttackState){
                speedMultiplier = spellCastMovementSpeed;
            } else {
                if (this.#inputManager.keys.sprint && forwardScalar === 1) {
                    movement.multiplyScalar(sprintMultiplier);
                }
                speedMultiplier = movementSpeed;
            }

            this.tempPosition.addScaledVector( movement, speedMultiplier * deltaTime );
        }
    }
}