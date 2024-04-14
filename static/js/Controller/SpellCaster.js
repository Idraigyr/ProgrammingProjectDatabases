import * as THREE from "three";
import {BuildSpell, EntitySpell, HitScanSpell, InstantSpell} from "../Model/Spell.js";
import {Subject} from "../Patterns/Subject.js";
import {slot1Key, slot2Key, slot3Key, slot4Key, slot5Key} from "../configs/Keybinds.js";
import {convertWorldToGridPosition} from "../helpers.js";

export class SpellCaster extends Subject{
    #wizard;
    constructor(params) {
        super(params);
        this.#wizard = null;
        this.raycaster = params.raycaster;
        this.renderingPreview = true;
        //TODO: make sure that every equipped spell that needs a preview Object has its preview created on equip.
        //TODO: maybe move this to somewhere else?
        this.manaBar = document.getElementsByClassName("ManaAmount")[0];
        this.chargeTimer = 0;
        this.currentObject = null;
    }

    set wizard(wizard){
        this.#wizard = wizard;
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
    createRenderSpellPreviewEvent(type, params){
        return new CustomEvent("RenderSpellPreview", {detail: {type: type, params: params}});
    }

    createVisibleSpellPreviewEvent(bool){
        return new CustomEvent("visibleSpellPreview", {detail: {visible: bool}});
    }

    //TODO: use for rotating buildings?
    createUpdateBuildSpellEvent(type, params){
        return new CustomEvent("updateBuildSpell", {detail: {type: type, params: params}});
    }

    createCastBuildSpellEvent(type, params){
        return new CustomEvent("castBuildSpell", {detail: {type: type, params: params}});
    }

    //return correct cast position based on spelltype (is almost always position of wizard wand);
    getSpellCastPosition(spell){
        //TODO: change
        return this.#wizard.position.clone().add(new THREE.Vector3(0,2,0));
    }

    onSpellSwitch(event){
        this.dispatchEvent(this.createVisibleSpellPreviewEvent(this.#wizard.spells[event.detail.spellSlot-1]?.hasPreview ?? false));
        // TODO: add sound
        // TODO: drop current object if it exists
        this.currentObject = null;
    }

    update(deltaTime) {
        if (this.#wizard?.getCurrentSpell()?.hasPreview) {
            //send to worldManager or viewManager
            this.dispatchEvent(this.createRenderSpellPreviewEvent(this.#wizard.getCurrentSpell(), {
                position: this.checkRaycaster(),
                rotation: this.#wizard.getCurrentSpell().previewRotates ? this.#wizard.phi : null}));
        }
        this.#wizard.updateCooldowns(deltaTime);
    }

    interact(event){
        const hit = this.checkRaycaster();
        if(hit){
            this.dispatchEvent(new CustomEvent("interact", {detail: {position: hit}}));
        }
    }

    checkRaycaster(){
        const hit = this.raycaster.getFirstHitWithWorld(this.getSpellCastPosition(this.#wizard.getCurrentSpell()), new THREE.Vector3(1, 0, 0).applyQuaternion(this.#wizard.rotation));
        if(hit.length > 0){
            return hit[0].point.clone();
        }
        return null;
    }

    //use as only signal for spells that can be cast instantly or use as signal to start charging a spell
    onLeftClickDown(){
        if (this.#wizard.canCast()) {
            let castPosition = this.getSpellCastPosition(this.#wizard.getCurrentSpell());

            if(this.#wizard.getCurrentSpell().worldHitScan){
                castPosition = this.checkRaycaster();
            }

            if(this.#wizard.getCurrentSpell().spell instanceof EntitySpell){
                this.dispatchEvent(this.createSpellEntityEvent(this.#wizard.getCurrentSpell(), {
                    position: castPosition,
                    horizontalRotation: this.#wizard.phi*180/Math.PI + 90,
                    //TODO: base direction on camera not on player direction
                    direction: new THREE.Vector3(1, 0, 0).applyQuaternion(this.#wizard.rotation),
                    team: this.#wizard.team
                }));
            } else if(this.#wizard.getCurrentSpell().spell instanceof InstantSpell){
                this.dispatchEvent(this.createInstantSpellEvent(this.#wizard.getCurrentSpell(), {}));
            }  else if (this.#wizard.getCurrentSpell() instanceof BuildSpell) {
                this.dispatchEvent(this.createCastBuildSpellEvent(this.#wizard.getCurrentSpell(), {
                    position: castPosition,
                    direction: new THREE.Vector3(1, 0, 0).applyQuaternion(this.#wizard.rotation)
                }));
            }
            this.#wizard.cooldownSpell();
        } else {
            //play a sad sound;
        }
    }

    //use as signal to release charging spells;
    onLeftClickUp(){

    }

    //use as signal for secondary spell action (e.g. buildspell rotation)
    onRightClickDown(){
        if(this.#wizard.getCurrentSpell() instanceof BuildSpell){
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