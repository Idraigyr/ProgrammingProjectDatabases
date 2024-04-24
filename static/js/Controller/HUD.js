import { Controller } from "./Controller.js";

/**
 * Class for the HUD controller
 */
export class HUD {

    /**
     * Constructor for the HUD class
     * @param {InputManager} inputManager
     */
    constructor(inputManager) {
        this.manaBar = document.getElementsByClassName("ManaAmount")[0];
        this.HealthBar = document.getElementsByClassName("HealthAmount")[0];
        this.crystals = document.getElementsByClassName("CrystalAmount")[0];
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

    /**
     * Function to update the mana bar in HUD
     * @param {{detail: {current: number, total: number}}} event
     */
    updateManaBar(event){
        document.body.style.setProperty("--currentMana", event.detail.current);
        document.body.style.setProperty("--maxMana", event.detail.total);
        this.manaBar.textContent = `${event.detail.current}/${event.detail.total}`;
    }

    /**
     * Function to update the health bar in HUD
     * @param {{detail: {current: number, total: number}}} event
     */
    updateHealthBar(event){
        document.body.style.setProperty("--currentHP",event.detail.current);
        document.body.style.setProperty("--maxHP",event.detail.total);
        this.HealthBar.textContent = `${event.detail.current}/${event.detail.total}`;
    }

    /**
     * Function to update the crystals in HUD
     * @param {{detail: {crystals: number}}} event
     */
    updateCrystals(event){
        this.crystals.textContent = event.detail.crystals;
    }

    /**
     * Function to update the level in HUD
     * @param {{detail: {level: number}}} event
     */
    updateLevel(event){
        $('#account-bar-level').html('Level: ' + event.detail.level);

    }
    updateXPThreshold(event){
        $('#xp-bar-status').html(event.detail.xp + '/' + event.detail.threshold);
    }


    /**
     * Function to update the username in HUD
     * @param {{detail: {username: string}}} event
     */
    updateUsername(event){
        $('#account-bar-name').html(event.detail.username);
    }

    /**
     * Function to update the xp bar in HUD
     * @param {{detail: {xp: number, threshold: number}}} event
     */
    updateXP(event){
        var percentage = ((event.detail.xp / event.detail.threshold) * 100);



      $("#xp-increase-fx").css("display","inline-block");
      $("#xp-bar-fill").css("box-shadow",/*"0px 0px 15px #06f,*/ "-5px 0px 10px #fff inset");
      setTimeout(function(){
        $("#xp-bar-fill").css("-webkit-transition","all 2s ease");
        $("#xp-bar-fill").css("width",percentage + "%");
      },100);

      setTimeout(function() {
        //increase points
        $('#xp-bar-status').html(event.detail.xp + '/' + event.detail.threshold);
      }, 10);

      setTimeout(function(){
        $("#xp-increase-fx").fadeOut(500);
        $("#xp-bar-fill").css({"-webkit-transition":"all 0.5s ease","box-shadow":""});
      },2000);

    }

    /**
     * Function to toggle visibility of the settings menu
     */
    toggleSettingsMenu() {
        const settingsMenu = document.querySelector(`.settings-container`);
        settingsMenu.classList.toggle('hide');
    }

    /**
     * Function to update the cooldowns in the HUD
     * @param event {{detail: {spellCooldowns: list}}
     */
    updateCooldowns(event) {
        let cooldowns = event.detail.cooldowns;
        for (let i = 0; i < cooldowns.length; i++) {
            let spellSlotIndex = i;
            let spellCooldown = cooldowns[i];
            const cooldownElement = document.querySelector(`.HotBarCooldown .Spell${spellSlotIndex + 1}Cooldown`);
            const usedSpel = document.querySelector(`.HotBar .Spell${spellSlotIndex + 1} .button`);
            const usedSpelIcon = document.querySelector(`.HotBarIcons .Spell${spellSlotIndex + 1}Icon`);
            usedSpelIcon.classList.add('onCooldown');
            if (spellCooldown <= 0) {
                cooldownElement.textContent = ""; // Clear the cooldown display
                usedSpel.parentElement.classList.remove('onCooldown');
                usedSpelIcon.classList.remove('onCooldown');
            } else {
                cooldownElement.textContent = spellCooldown.toFixed(2) + "s"; // Update the cooldown display
                usedSpel.parentElement.classList.add('onCooldown');
                usedSpelIcon.classList.add('onCooldown');
            }
        }
    }
}
