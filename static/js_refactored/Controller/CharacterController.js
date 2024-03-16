import {Subject} from "../Patterns/Subject.js";
import {horizontalSensitivity, movementSpeed, sprintMultiplier, verticalSensitivity} from "../configs/ControllerConfigs.js";
import * as THREE from "three";
import {max} from "../helpers.js";
import {Factory} from "./Factory.js";
import {BuildSpell} from "../Model/Spell.js";

export class CharacterController extends Subject{
    _character;
    #inputManager;

    //TODO: temporary values move logic to charFSM
    #jumping = false;
    #falling = false;
    constructor(params) {
        super();
        this._character = params.Character;
        this.#inputManager = params.InputManager;

    }

    createSpellCastEvent(type, params){
        return new CustomEvent("castSpell", {detail: {type: type, params: params}});
    }

    createUpdateBuildSpellEvent(type, params){
        return new CustomEvent("updateBuildSpell", {detail: {type: type, params: params}});
    }

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

    get quatFromHorizontalRotation(){
        const qHorizontal = new THREE.Quaternion();
        qHorizontal.setFromAxisAngle(new THREE.Vector3(0,1,0), this._character.phi);
        return qHorizontal;
    }

    update(deltaTime) {
        if (!this._character.fsm.currentState) {
            return;
        }

        this._character.currentSpell = this.#inputManager.keys.spellSlot - 1;
        this._character.fsm.updateState(deltaTime, this.#inputManager);

        if (this._character.fsm.currentState.movementPossible) {
            //TODO: add collision checks for movement
            const qHorizontal = this.quatFromHorizontalRotation;

            let velocity = new THREE.Vector3(1, 0, 0);
            let strafe = new THREE.Vector3(0, 0, 1);
            velocity.applyQuaternion(qHorizontal);
            strafe.applyQuaternion(qHorizontal);

            let forwardScalar = 0;
            forwardScalar += this.#inputManager.keys.forward ? 1 : 0;
            forwardScalar -= this.#inputManager.keys.backward ? 1 : 0;

            let strafeScalar = 0;

            strafeScalar += this.#inputManager.keys.right ? 1 : 0;
            strafeScalar -= this.#inputManager.keys.left ? 1 : 0;

            velocity.multiplyScalar(forwardScalar);

            strafe.multiplyScalar(strafeScalar);

            velocity.add(strafe);

            velocity.normalize();

            velocity.multiplyScalar(movementSpeed * deltaTime);

            if (this.#inputManager.keys.sprint && forwardScalar === 1) {
                velocity.multiplyScalar(sprintMultiplier);
            }

            //TODO: add floor collision instead of this.position.y check
            if (this.#inputManager.keys.up && this._character.position.y === 0) {
                this.#jumping = true;
            }

            if (this._character.position.y > 4) {
                this.#jumping = false;
                this.#falling = true;
            }

            if (this.#jumping) {
                velocity.add(new THREE.Vector3(0, 10 * deltaTime, 0));
            }
            if (this.#falling) {
                velocity.add(new THREE.Vector3(0, -8 * deltaTime, 0));
            }

            this._character.position = (this._character.position.add(velocity));
            if (this._character.position.y < 0) {
                this._character.position.y = 0;
                this.#falling = false;
            }
        }

        if (this.#inputManager.mouse.leftClick) {
            if (this._character.getCurrentSpell() && this._character.currentSpellCooldown === 0) {
                //cast current spell
                let vec = new THREE.Vector3().copy(this._character.position);
                vec.y += 2;
                this.dispatchEvent(this.createSpellCastEvent(this._character.getCurrentSpell(), {
                    position: vec,
                    direction: new THREE.Vector3(1, 0, 0).applyQuaternion(this._character.rotation)
                }));
                this._character.cooldownSpell();
            }
        } else if (this._character.getCurrentSpell() instanceof BuildSpell) {
            this.dispatchEvent(this.createUpdateBuildSpellEvent(this._character.getCurrentSpell(), {}));
        }
        if (this.#inputManager.mouse.rightClick) {
            if (this._character.getCurrentSpell() instanceof BuildSpell) {
                const customEvent = new CustomEvent('turnPreviewSpell', { detail: {} });
                document.dispatchEvent(customEvent);
            }
        }
    }
}