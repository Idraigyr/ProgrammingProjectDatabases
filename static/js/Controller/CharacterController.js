import {Subject} from "../Patterns/Subject.js";
import {
    horizontalSensitivity,
    movementSpeed,
    sprintMultiplier,
    gravity,
    verticalSensitivity,
    spellCastMovementSpeed
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

    //TODO: temporary values move logic to charFSM
    #jumping = false;
    #falling = false;
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
     * creates a custom event notifying an EntitySpell being cast
     * @param {ConcreteSpell} type
     * @param {object} params
     * @returns {CustomEvent<{type: ConcreteSpell, params: {object}}>}
     */
    createSpellEntityEvent(type, params){
        return new CustomEvent("createSpellEntity", {detail: {type: type, params: params}});
    }

    /**
     * creates a custom event notifying a BuildSpell being cast
     * @param {ConcreteSpell} type
     * @param {object} params
     * @returns {CustomEvent<{type: ConcreteSpell, params: {object}}>}
     */
    createSpellCastEvent(type, params){
        return new CustomEvent("castSpell", {detail: {type: type, params: params}});
    }

    /**
     * creates a custom event notifying a HitScanSpell being cast
     * @param {ConcreteSpell} type
     * @param {object} params
     * @returns {CustomEvent<{type: ConcreteSpell, params: {object}}>}
     */
    createHitScanSpellEvent(type, params){
        return new CustomEvent("hitScanSpell", {detail: {type: type, params: params}});
    }

    /**
     * creates a custom event notifying an InstantSpell being cast
     * @param {ConcreteSpell} type
     * @param {object} params
     * @returns {CustomEvent<{type: ConcreteSpell, params: {object}}>}
     */
    createInstantSpellEvent(type, params){
        return new CustomEvent("InstantSpell", {detail: {type: type, params: params}});
    }

    /**
     * creates a custom event notifying an EntitySpell being cast
     * @param {ConcreteSpell} type
     * @param {object} params
     * @returns {CustomEvent<{type: ConcreteSpell, params: {object}}>}
     */
    createUpdateBuildSpellEvent(type, params){
        return new CustomEvent("updateBuildSpell", {detail: {type: type, params: params}});
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
    onClickEvent(event){
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
        const correctedDeltaTime = min(deltaTime, 0.1);
        this.tempTemp.copy(this.tempPosition);

        if ( this._character.onGround ) {
                this._character.velocity.y = correctedDeltaTime * gravity;
        } else {
            this._character.velocity.y += correctedDeltaTime * gravity;
        }

        this.tempPosition.addScaledVector( this._character.velocity, correctedDeltaTime );

        let deltaVector = this.collisionDetector.adjustPlayerPosition(this._character, this.tempPosition, correctedDeltaTime);

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
        if (!this._character.fsm.currentState) {
            return;
        }

        this._character.currentSpell = this.#inputManager.keys.spellSlot - 1;
        this._character.fsm.updateState(deltaTime, this.#inputManager);

        if (this._character.fsm.currentState.movementPossible) {
            // if ( this._character.onGround ) {
            //     if(this.#inputManager.keys.up) {
            //         this._character.velocity.y = 10;
            //         this._character.onGround = false;
            //     } else {
            //         this._character.velocity.y = deltaTime * gravity;
            //     }
            // } else {
            //     this._character.velocity.y += deltaTime * gravity;
            // }

            if(this.#inputManager.keys.up && this._character.onGround) {
                this._character.velocity.y = 10;
                this._character.onGround = false;
            }

            // this.tempPosition.addScaledVector( this._character.velocity, deltaTime );

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

            // let deltaVector = this.collisionDetector.adjustPlayerPosition(this._character, position, deltaTime);
            //
            // if ( ! this._character.onGround ) {
            //     deltaVector.normalize();
            //     this._character.velocity.addScaledVector( deltaVector, - deltaVector.dot( this._character.velocity ) );
            // } else {
            //     this._character.velocity.set( 0, 0, 0 );
            // }
            //
            // if ( this._character.position.y < - 50 ) {
            //     //respawn
            //     this._character.velocity.set(0,0,0);
            //     this._character.position = this._character.spawnPoint;
            // } else {
            //     this._character.position = position;
            // }
        }

        //TODO: move spellCasting logic into a seperate class
        if (this.#inputManager.mouse.leftClick) {
            if (this._character.getCurrentSpell() && this._character.currentSpellCooldown === 0) {
                //cast current spell
                let vec = new THREE.Vector3().copy(this._character.position);
                vec.y += 2;
                if(this._character.getCurrentSpell().spell instanceof EntitySpell){
                    this.dispatchEvent(this.createSpellEntityEvent(this._character.getCurrentSpell(), {
                        position: vec,
                        direction: new THREE.Vector3(1, 0, 0).applyQuaternion(this._character.rotation)
                    }));
                } else if(false && this._character.getCurrentSpell().spell instanceof HitScanSpell){
                    this.dispatchEvent(this.createHitScanSpellEvent(this._character.getCurrentSpell(), {}));
                } else if(this._character.getCurrentSpell().spell instanceof InstantSpell){
                    this.dispatchEvent(this.createInstantSpellEvent(this._character.getCurrentSpell(), {}));
                }  else if (this._character.getCurrentSpell() instanceof BuildSpell) {
                    this.dispatchEvent(this.createSpellCastEvent(this._character.getCurrentSpell(), {
                        position: vec,
                        direction: new THREE.Vector3(1, 0, 0).applyQuaternion(this._character.rotation)
                    }));
                }
                this._character.cooldownSpell();
            }
        } else if (this._character.getCurrentSpell() instanceof BuildSpell) {
            //TODO: make building placeholder invisible if buildspell not equipped (Object3D.visible = false)
            this.dispatchEvent(this.createUpdateBuildSpellEvent(this._character.getCurrentSpell(), {}));
        }
        this._character.updateCooldowns(deltaTime);
    }
}