import { Controller } from "./Controller.js";

export class HUD {

    constructor(inputManager) {
        // Add event listener for spell slot index change
        inputManager.addEventListener("spellSlotChange", this.updateHoveredButton.bind(this));
        inputManager.addSettingButtonListener(this.toggleSettingsMenu.bind(this))
    }

    /**
     * Function to visualy update the selected spell slot when called
     *
     */
    updateHoveredButton(event) {

        // Remove hover class from all buttons
        document.querySelectorAll('.HotBar .item').forEach(button => {
            button.classList.remove('hovered');
        });

        // Add hover class to the button corresponding to the spell slot index
        const hoveredButton = document.querySelector(`.HotBar .Spell${event.detail.spellSlot} .button`);
        hoveredButton.parentElement.classList.add('hovered');

    }
    toggleSettingsMenu(event)
    {
        const settingsMenu = document.querySelector(`.container`);
        settingsMenu.classList.toggle('hide');
    }
}
