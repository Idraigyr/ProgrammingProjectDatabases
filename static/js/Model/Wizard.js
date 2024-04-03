import {Character} from "./Character.js";
import {max} from "../helpers.js";

/**
 * @class Wizard - class for the player character
 */
export class Wizard extends Character{
    constructor(params) {
        super(params);
        this.spells = [null,null,null,null,null];
        this.spellCooldowns = [0,0,0,0,0];
        this.currentSpell = 0;
        this.mana = params?.mana ?? 100;
        this.maxMana = params?.maxMana ?? 100;
    }

    /**
     * Change the equipped spell
     * @param index - index of the spell slot to equip
     * @param newSpell - new spell to equip
     */
    changeEquippedSpell(index, newSpell){
        this.spells.splice(index,1,newSpell);
        this.spellCooldowns.splice(index,1,newSpell.getCooldown());
    }

    /**
     * Update the cooldowns of the equipped spells
     * @param deltaTime - time since last update
     */
    updateCooldowns(deltaTime){
        this.spellCooldowns.forEach((cooldown, index, array) => {
            array[index] = max(0,cooldown -= deltaTime);
        });
    }

    /**
     * Update cooldown of the current spell
     */
    cooldownSpell(){
        this.spellCooldowns[this.currentSpell] = this.spells[this.currentSpell].getCooldown();
        this.mana -= this.spells[this.currentSpell].cost;
        this.dispatchEvent(this.#createUpdateManaEvent());
    }

    /**
     * Get the current spell cooldown
     * @returns {number|number} - the current spell cooldown
     */
    get currentSpellCooldown(){
        return this.getCurrentSpell() ? this.spellCooldowns[this.currentSpell] :  -1;
    }

    /**
     * Get the current spell
     * @returns current spell
     */
    getCurrentSpell(){
        return this.spells[this.currentSpell];
    }

    canCast(){
        return (this.getCurrentSpell() ? (this.spellCooldowns[this.currentSpell] === 0 && this.mana >= this.getCurrentSpell().cost) : false);
    }

    /**
     * refill the mana of the player
     * @param {Number} amount - amount of mana to refill
     */
    changeCurrentMana(amount){
        this.mana = amount > 0 ? Math.min(this.maxMana, this.mana + amount) : Math.max(0, this.mana + amount);
        this.dispatchEvent(this.#createUpdateManaEvent());
    }

    /**
     * refill the health of the player
     * @param {Number} amount - amount of health to refill
     */
    changeCurrentHealth(amount){
        this.health = amount > 0 ? Math.min(this.maxHealth, this.health + amount) : Math.max(0, this.health + amount);
        this.dispatchEvent(this.#createUpdateHealthEvent());
    }

    /**
     * Increase the maximum mana of the player
     * @param {Number} amount - amount to increase the maximum mana by, needs to be bigger than 0
     */
    increaseMaxMana(amount){
        this.maxMana += amount;
        //this.mana += amount;
    }

    /**
     * Increase the maximum health of the player
     * @param {Number} amount - amount to increase the maximum health by, needs to be bigger than 0
     */
    increaseMaxHealth(amount){
        this.maxHealth += amount;
        //this.health += amount;
    }

    advertiseCurrentCondition(){
        this.health = 20;
        this.dispatchEvent(this.#createUpdateManaEvent());
        this.dispatchEvent(this.#createUpdateHealthEvent());
    }


    /**
     * Get the type of the entity
     * @returns {string} - the type of the entity
     */
    get type(){
        return "player";
    }

    #createUpdateManaEvent() {
        return new CustomEvent("updateMana", {detail: {current: this.mana, total: this.maxMana}});
    }

    #createUpdateHealthEvent() {
        return new CustomEvent("updateHealth", {detail: {current: this.health, total: this.maxHealth}});
    }
}