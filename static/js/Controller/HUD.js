import { Controller } from "./Controller.js";

export class HUD {
    #inputManager = Controller.InputManager;

    constructor(InputManager) {
        this.#inputManager = InputManager;
        // Add event listener for spell slot index change
        this.#inputManager.addSpellSlotChangeListener(this.updateHoveredButton.bind(this));
        this.#inputManager.addSettingButtonListener(this.toggleSettingsMenu.bind(this));
        document.addEventListener("openBuildMenu", this.openBuildMenu.bind(this));
        document.addEventListener("openAltarMenu", this.openAltarMenu.bind(this));
        document.addEventListener("openFusionTableMenu", this.openFusionTableMenu.bind(this));
        document.addEventListener("openTowerMenu", this.openTowerMenu.bind(this));
        document.addEventListener("openMineMenu", this.openMineMenu.bind(this));
        // Add message listener for menu's
        window.addEventListener("message", this.messageListener.bind(this));
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
    toggleSettingsMenu()
    {
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
        const menu = document.querySelector(`#buildMenu`);
        menu.classList.add('hide');
    }
    openAltarMenu()
    {
        const menu = document.querySelector(`#altarMenu`);
        menu.classList.remove('hide');
    }
    closeAltarMenu()
    {
        const menu = document.querySelector(`#altarMenu`);
        menu.classList.add('hide');
    }
    openFusionTableMenu()
    {
        const menu = document.querySelector(`#fusionTableMenu`);
        menu.classList.remove('hide');
    }
    closeFusionTableMenu()
    {
        const menu = document.querySelector(`#fusionTableMenu`);
        menu.classList.add('hide');
    }
    openTowerMenu()
    {
        const menu = document.querySelector(`#towerMenu`);
        menu.classList.remove('hide');
    }
    closeTowerMenu()
    {
        const menu = document.querySelector(`#towerMenu`);
        menu.classList.add('hide');
    }
    openMineMenu()
    {
        const menu = document.querySelector(`#mineMenu`);
        menu.classList.remove('hide');
    }
    closeMineMenu()
    {
        const menu = document.querySelector(`#mineMenu`);
        menu.classList.add('hide');
    }
    messageListener(event)
    {
        if(event.data === "closeBuildMenu")
        {
            this.closeBuildMenu();
        }else if(event.data === "closeTowerMenu")
        {
            this.openBuildMenu();
        }
        else if (event.data === "closeAltarMenu")
        {
            this.closeAltarMenu();
        }
        else if (event.data === "closeFusionTableMenu")
        {
            this.closeFusionTableMenu();
        }
        else if (event.data === "closeMineMenu")
        {
            this.closeMineMenu();
        }
    }
}
