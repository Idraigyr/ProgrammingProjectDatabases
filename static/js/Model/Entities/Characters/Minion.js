import * as THREE from "three";
import {Character} from "./Character.js";

/**
 * Class representing a Minion
 * @extends Character
 */
export class Minion extends Character{
    constructor(params) {
        super(params);
        this.minionType = params?.minionType ?? "Warrior";
        this.tempPosition = this.spawnPoint.clone();
        this.lastMovementVelocity = new THREE.Vector3();
        this.input = {blockedInput: false, currentTarget: null, currentNode: null, currentNodeIndex: 0};
        this.buildingID = params?.buildingID ?? null; // only used for friendly minions
        this.lastAction = "Idle"; // Idle, WalkToAltar, FollowEnemy, AttackEnemy
    }

    /**
     * cleans up the current target of the minion for deletion
     */
    #disposeOfTarget(){
        if(this.target){
            this.target.removeEventListener("delete", this.#disposeOfTarget.bind(this));
            this.input.currentTarget = null;
        }
    }

    /**
     * setter for the target of the minion
     * @param {ProxyEntity | Character} target
     */
    set target(target) {
        if(this.input.currentTarget === target) return;
        if(this.input.currentTarget){
            this.#disposeOfTarget();
        }
        this.input.currentTarget = target;
        if(this.input.currentTarget){
            this.input.currentTarget.addEventListener("delete", this.#disposeOfTarget.bind(this));
        }
    }

    /**
     * getter for the target of the minion
     * @return {ProxyEntity | Character | null}
     */
    get target() {
        return this.input.currentTarget;
    }

    /**
     * Function that gets called when the minion dies
     */
    dies() {
        this.dispatchEvent(this.createDeleteEvent());
    }

    /**
     * Function that gets called when the minion attacks a target
     * @param target
     */
    attack() {
        this.target?.takeDamage(10);
    }
    setId(data) {
        this.id = data.id;
    }

    /**
     * Create a CustomEvent for dispatching the current (animation) state of the minion
     * @param event
     * @return {CustomEvent<unknown>}
     */
    createUpdatedStateEvent(event){
        return new CustomEvent("updatedState", {detail: {...event.detail, id: this.id}});
    }

    /**
     * overrides the health update event from Character to include the id of the minion (used for multiplayer)
     * @param {number} prevHealth
     * @return {CustomEvent<{current: (*|number), total: (*|number), id}>}
     */
    createHealthUpdateEvent(prevHealth) {
        const event = super.createHealthUpdateEvent(prevHealth);
        event.detail.id = this.id;
        return event;
    }
}