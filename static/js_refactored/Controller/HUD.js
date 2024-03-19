import { Controller } from "./Controller.js";

export class HUD {
    #inputManager = Controller.InputManager;

    constructor(InputManager) {
        this.#inputManager = InputManager;
        // Add event listener for spell slot index change
        this.#inputManager.addSpellSlotChangeListener(this.updateHoveredButton.bind(this));
    }

    /**
     * Function to visualy update the selected spell slot when called
     *
     */
    updateHoveredButton() {
        const spellSlotIndex = this.#inputManager.keys.spellSlot;

        console.log("Spell Slot Index:", spellSlotIndex);

        // Remove hover class from all buttons
        document.querySelectorAll('.HotBar .item').forEach(button => {
            button.classList.remove('hovered');
        });

        // Add hover class to the button corresponding to the spell slot index
        const hoveredButton = document.querySelector(`.HotBar .Spell${spellSlotIndex} .button`);
        hoveredButton.parentElement.classList.add('hovered');

    }
}
