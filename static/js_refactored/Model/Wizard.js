import {Character} from "./Character.js";
import {max} from "../helpers.js";

export class Wizard extends Character{
    constructor() {
        super();
        this.spells = [null,null,null,null,null];
        this.spellCooldowns = [0,0,0,0,0];
        this.currentSpell = 0;
    }
    changeEquippedSpell(index, newSpell){
        this.spells.splice(index,1,newSpell);
        this.spellCooldowns.splice(index,1,newSpell.getCooldown());
    }

    updateCooldowns(deltaTime){
        this.spellCooldowns.forEach((cooldown, index, array) => {
            array[index] = max(0,cooldown -= deltaTime);
        });
    }

    cooldownSpell(){
        this.spellCooldowns[this.currentSpell] = this.spells[this.currentSpell].getCooldown();
    }

    get currentSpellCooldown(){
        return this.spellCooldowns[this.currentSpell] ?? -1;
    }

    getCurrentSpell(){
        return this.spells[this.currentSpell];
    }
}