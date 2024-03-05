import {Character} from "./Character";
import {max} from "../helpers";

export class Wizard extends Character{
    constructor() {
        super();
        this.spells = [null,null,null,null,null];
        this.spellCooldowns = [null,null,null,null,null];
        this.currentSpell = 0;
    }
    changeEquippedSpell(index, newSpell){
        this.spells.splice(index,1,newSpell);
        this.spellCooldowns.splice(index,1,newSpell.cooldown);
    }

    updateCooldowns(deltaTime){
        this.spellCooldowns.forEach((cooldown) => {
            cooldown = max(0,cooldown -= deltaTime);
        });
    }

    get currentSpellCooldown(){
        return this.spellCooldowns[this.spells];
    }
}