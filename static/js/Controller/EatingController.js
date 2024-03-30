import * as THREE from "three";
import {BuildSpell, EntitySpell, HitScanSpell, InstantSpell} from "../Model/Spell.js";
import {Subject} from "../Patterns/Subject.js";
import {slot1Key, slot2Key, slot3Key, slot4Key, slot5Key} from "../configs/Keybinds.js";

export class EatingController extends Subject {

    #wizard;
    constructor(params) {
        super(params);
        this.#wizard = null;
        this.manaBar = document.getElementsByClassName("ManaAmount")[0];
    }

    set wizard(wizard){
        this.#wizard = wizard;
        document.body.style.setProperty("--maxMana", this.#wizard.maxMana);
        this.changeManaBar();
    }

    /**
     * creates a custom event notifying eating being started
     * @returns {CustomEvent<{}>}
     */
    createEatingEvent(type, params){
        return new CustomEvent("eatingEvent", {});
    }

    changeManaBar(){
        document.body.style.setProperty("--currentMana", this.#wizard.mana);
        this.manaBar.textContent = `${this.#wizard.mana}/${this.#wizard.maxMana}`;
    }

    eat() {
        console.log("eating")
    }

}