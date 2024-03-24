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
        this.mana = 100;
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
    }

    /**
     * Get the current spell cooldown
     * @returns {number|number} - the current spell cooldown
     */
    get currentSpellCooldown(){
        return this.spellCooldowns[this.currentSpell] ?? -1;
    }

    /**
     * Get the current spell
     * @returns current spell
     */
    getCurrentSpell(){
        return this.spells[this.currentSpell];
    }

    /**
     * Get the type of the entity
     * @returns {string} - the type of the entity
     */
    get type(){
        return "player";
    }
}