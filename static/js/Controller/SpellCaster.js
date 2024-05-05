import * as THREE from "three";
import {BuildSpell, EntitySpell, HitScanSpell, InstantSpell} from "../Model/Spell.js";
import {Subject} from "../Patterns/Subject.js";
import {convertWorldToGridPosition, mapDegreesToNearestQuarter} from "../helpers.js";

/**
 * Class for the SpellCaster
 */
export class SpellCaster extends Subject{
    #wizard;
    #currentObject;

    /**
     * Constructor for the SpellCaster
     * @param {{raycaster: Raycaster}} params
     */
    constructor(params) {
        super(params);
        this.#wizard = null;
        this.raycaster = params.raycaster;
        this.renderPreview = true;
        this.multiplayer = false;
        //TODO: make sure that every equipped spell that needs a preview Object has its preview created on equip.
        //TODO: maybe move this to somewhere else?
        this.manaBar = document.getElementsByClassName("ManaAmount")[0];
        this.chargeTimer = 0;
        this.previousSelectedPosition = null;
        this.camera = params.camera;
        this.currentObject = null;
    }

    /**
     * Sets the wizard of the SpellCaster
     * @param wizard
     */
    set wizard(wizard){
        this.#wizard = wizard;
    }

    /**
     * sets the current object
     * @param object
     */
    //TODO: move this?
    set currentObject(object){
        this.#currentObject = object;
        this.previousSelectedPosition = object?.position.clone();
    }

    /**
     * returns the current object
     * @return {*}
     */
    get currentObject(){
        return this.#currentObject;
    }

    /**
     * creates a custom event notifying an EntitySpell being cast
     * @param {ConcreteSpell} type
     * @param {object} params
     * @returns {CustomEvent<{type: ConcreteSpell, params: {object}}>}
     */
    createSpellEntityEvent(type, params){
        return new CustomEvent("createSpellEntity", {detail: {type: type.constructor, params: params}});
    }

    /**
     * creates a custom event notifying a spell being cast
     * @param {number} spellCooldown
     * @param {number} spellSlotIndex
     * @returns {CustomEvent<{detail : {spellCooldown: number,spellSlotIndex: number}>
     */
    createSpellCastEvent(spellCooldown, spellSlotIndex){
        return new CustomEvent("castSpell", {detail: {spellCooldown: spellCooldown, spellSlotIndex: spellSlotIndex}});
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
    createRenderSpellPreviewEvent(type, params){
        return new CustomEvent("RenderSpellPreview", {detail: {type: type, params: params}});
    }

    createVisibleSpellPreviewEvent(bool){
        return new CustomEvent("visibleSpellPreview", {detail: {visible: bool}});
    }

    //TODO: use for rotating buildings?
    /**
     * not used
     * @param type
     * @param params
     * @return {CustomEvent<{type, params}>}
     */
    createUpdateBuildSpellEvent(type, params){
        return new CustomEvent("updateBuildSpell", {detail: {type: type, params: params}});
    }

    /**
     * creates a custom event notifying a BuildSpell being cast
     * @param type
     * @param params
     * @return {CustomEvent<{type, params}>}
     */
    createCastBuildSpellEvent(type, params){
        return new CustomEvent("castBuildSpell", {detail: {type: type, params: params}});
    }



    //return correct cast position based on spelltype (is almost always position of wizard wand);
    /**
     * Get the position where the spell should be cast
     * @param spell
     * @return {*}
     */
    getSpellCastPosition(spell){
        //TODO: change
        return this.camera.position.clone().addScaledVector(new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion), 6); //TODO: change scalar depending on camera distance from character
    }

    /**
     * change state for next spell
     * @param event
     */
    onSpellSwitch(event){
        this.dispatchVisibleSpellPreviewEvent((!(this.multiplayer && event.detail.spellSlot-1 === 0) && this.#wizard.spells[event.detail.spellSlot-1]?.hasPreview) ?? false);
        // TODO: add sound
        // TODO: drop current object if it exists
        if(this.currentObject){
            this.currentObject.position = this.previousSelectedPosition;
            this.currentObject.ready = true;
        }
        this.previousSelectedPosition = null;
        this.currentObject = null;
        this.raycaster.collisionDetector.generateColliderOnWorker();
    }

    dispatchVisibleSpellPreviewEvent(bool){
        this.dispatchEvent(this.createVisibleSpellPreviewEvent(bool));
    }

    /**
     * update cooldowns and potential spellPreview
     * @param deltaTime
     */
    update(deltaTime) {
        if (this.#wizard?.getCurrentSpell()?.hasPreview) {
            //send to worldManager or viewManager
            this.dispatchEvent(this.createRenderSpellPreviewEvent(this.#wizard.getCurrentSpell(), {
                position: this.checkRaycaster(),
                rotation: this.#wizard.getCurrentSpell().previewRotates ? this.#wizard.phi : null}));
            // If there is currentObject, update its position
            if(this.currentObject){
                let pos = this.checkRaycaster();
                if(pos){
                    // Correct the position of the object
                    convertWorldToGridPosition(pos); //TODO @Daria: move somewhere else (buildManager?) and add island position
                    pos.y = 0;
                    // Set the position of the object
                    this.currentObject.position = pos;
                }
            }
        }
        this.#wizard.updateCooldowns(deltaTime);
    }

    createInteractEvent(position){
        return new CustomEvent("interact", {
            detail: {
                position: position,
                rotation: mapDegreesToNearestQuarter(this.#wizard.phi*180/Math.PI)
            }}
        );
    }

    /**
     * dispatch event for interacting with the world
     * @param event
     */
    interact(event){
        if(this.multiplayer) return;
        const hit = this.checkRaycaster();
        if(hit){
            this.dispatchEvent(this.createInteractEvent(hit));
        }
    }

    /**
     * check for hit with raycaster
     * @return {*|null}
     */
    checkRaycaster(){
        // const hit = this.raycaster.getFirstHitWithWorld(this.getSpellCastPosition(this.#wizard.getCurrentSpell()), new THREE.Vector3(1, 0, 0).applyQuaternion(this.#wizard.rotation));
        const hit = this.raycaster.getFirstHitWithWorld(this.camera.position, new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion));
        if(hit.length > 0){
            return hit[0].point.clone();
        }
        return null;
    }

    //use as only signal for spells that can be cast instantly or use as signal to start charging a spell
    /**
     * cast spell on left click down
     */
    onLeftClickDown(){
        if (this.#wizard.canCast()) {

            let castPosition = this.getSpellCastPosition(this.#wizard.getCurrentSpell());

            if(this.#wizard.getCurrentSpell().worldHitScan){
                castPosition = this.checkRaycaster();
                if(!castPosition) return;
            }

            if(this.#wizard.getCurrentSpell().spell instanceof EntitySpell){
                this.dispatchEvent(this.createSpellEntityEvent(this.#wizard.getCurrentSpell(), {
                    position: castPosition,
                    horizontalRotation: this.#wizard.phi*180/Math.PI + 90,
                    //TODO: base direction on camera not on player direction
                    direction: new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion), //new THREE.Vector3(1, 0, 0).applyQuaternion(this.#wizard.rotation)
                    team: this.#wizard.team,
                    playerID: this.#wizard.id
                }));
                this.#wizard.cooldownSpell();
            } else if(this.#wizard.getCurrentSpell().spell instanceof InstantSpell){
                this.dispatchEvent(this.createInstantSpellEvent(this.#wizard.getCurrentSpell(), {}));
                this.#wizard.cooldownSpell();
            }  else if (this.#wizard.getCurrentSpell() instanceof BuildSpell && !this.multiplayer) {
                this.dispatchEvent(this.createCastBuildSpellEvent(this.#wizard.getCurrentSpell(), {
                    position: castPosition,
                    rotation: mapDegreesToNearestQuarter(this.#wizard.phi*180/Math.PI)
                }));
                if(!this.currentObject){
                    this.#wizard.cooldownSpell();
                }
            }
        } else {
            //play a sad sound;
        }
    }

    //use as signal to release charging spells;
    onLeftClickUp(){

    }

    //use as signal for secondary spell action (e.g. buildspell rotation)
    /**
     * rotate object on right click down if build spell is equipped
     */
    onRightClickDown(){
        if(this.#wizard.getCurrentSpell() instanceof BuildSpell && !this.multiplayer){
            // If there is currentObject, rotate it
            if(this.currentObject){
                this.currentObject.rotate();
            }
        }
    }

    // just for completion, can't think of a use just yet
    onRightClickUp(){

    }
}