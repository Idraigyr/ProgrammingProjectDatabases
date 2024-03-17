
import {InputManager} from "./InputManager"
import {Controller} from "./Controller";
export class HUD {
    constructor(inputManager) {
        this.inputManager = inputManager;
        this.setupSpellButtons();
        this.setupEventListeners();
    }

    setupSpellButtons() {
        // Add data-spell-slot attribute to each button to identify their corresponding spell slot index
        document.querySelectorAll('.hotbar-button').forEach((button, index) => {
            button.dataset.spellSlot = index + 1;
        });
    }

    setupEventListeners() {
        // Add event listener to update the hovered button when the spell slot index changes
        this.inputManager.addEventListener('spellSlotChange', this.updateHoveredButton.bind(this));
    }

    updateHoveredButton() {
        const spellSlotIndex = this.inputManager.keys.spellSlot;

        // Remove hover class from all buttons
        document.querySelectorAll('.hotbar-button').forEach(button => {
            button.classList.remove('hovered');
        });

        // Add hover class to the button corresponding to the spell slot index
        const hoveredButton = document.querySelector(`.hotbar-button[data-spell-slot="${spellSlotIndex}"]`);
        if (hoveredButton) {
            hoveredButton.classList.add('hovered');
        }
    }
}
