import { Controller } from "./Controller.js";

export class HUD {
    #inputManager = Controller.InputManager;

    constructor(InputManager) {
        this.#inputManager = InputManager;
        // Add event listener for spell slot index change
        this.#inputManager.addSpellSlotChangeListener(this.updateHoveredButton.bind(this));
        this.#inputManager.addSettingButtonListener(this.toggleSettingsMenu.bind(this));
        document.addEventListener("openBuildMenu", this.openBuildMenu.bind(this));
        document.addEventListener("closeBuildMenu", this.closeBuildMenu.bind(this));
    }

    /**
     * Function to visualy update the selected spell slot when called
     *
     */
    updateHoveredButton() {
        const spellSlotIndex = this.#inputManager.keys.spellSlot;

        // Remove hover class from all buttons
        document.querySelectorAll('.HotBar .item').forEach(button => {
            button.classList.remove('hovered');
        });

        // Add hover class to the button corresponding to the spell slot index
        const hoveredButton = document.querySelector(`.HotBar .Spell${spellSlotIndex} .button`);
        hoveredButton.parentElement.classList.add('hovered');

    }

    toggleSettingsMenu() {
        const settingsMenu = document.querySelector(`.container`);
        settingsMenu.classList.toggle('hide');
    }
    openBuildMenu()
    {
        const buildMenu = document.querySelector(`#buildMenu`);
        buildMenu.classList.remove('hide');
    }
    closeBuildMenu()
    {
        const buildMenu = document.querySelector(`#buildMenu`);
        buildMenu.classList.add('hide');
    }
}

    useSpell(spellCooldown) {
        const spellSlotIndex = this.#inputManager.keys.spellSlot;

        const usedSpel = document.querySelector(`.HotBar .Spell${spellSlotIndex} .button`);
        usedSpel.parentElement.classList.add('onCooldown');

        const usedSpelIcon = document.querySelector(`.HotBarIcons .Spell${spellSlotIndex}Icon`);
        usedSpelIcon.classList.add('onCooldown');

        setTimeout(function() {
        usedSpel.parentElement.classList.remove('onCooldown');
        usedSpelIcon.classList.remove('onCooldown');
        }, spellCooldown * 1000);
    }
}