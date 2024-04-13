import { Controller } from "./Controller.js";

export class HUD {

    constructor(inputManager) {
        this.manaBar = document.getElementsByClassName("ManaAmount")[0];
        this.HealthBar = document.getElementsByClassName("HealthAmount")[0];
        this.crystals = document.getElementsByClassName("CrystalAmount")[0];
        // Add event listener for spell slot index change
        inputManager.addEventListener("spellSlotChange", this.updateHoveredButton.bind(this));
        inputManager.addSettingButtonListener(this.toggleSettingsMenu.bind(this))
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
    updateHoveredButton(event) {

        // Remove hover class from all buttons
        document.querySelectorAll('.HotBar .item').forEach(button => {
            button.classList.remove('hovered');
        });

        // Add hover class to the button corresponding to the spell slot index
        const hoveredButton = document.querySelector(`.HotBar .Spell${event.detail.spellSlot} .button`);
        hoveredButton.parentElement.classList.add('hovered');

    }

    updateManaBar(event){
        document.body.style.setProperty("--currentMana", event.detail.current);
        document.body.style.setProperty("--maxMana", event.detail.total);
        this.manaBar.textContent = `${event.detail.current}/${event.detail.total}`;
    }

    updateHealthBar(event){
        document.body.style.setProperty("--currentHP",event.detail.current);
        document.body.style.setProperty("--maxHP",event.detail.total);
        this.HealthBar.textContent = `${event.detail.current}/${event.detail.total}`;
    }

    updateCrystals(event){
        this.crystals.textContent = event.detail.crystals;
    }

    updateLevel(event){
        $('#account-bar-level').html('Level: ' + event.detail.level);
    }

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

    toggleSettingsMenu() {
        const settingsMenu = document.querySelector(`.container`);
        settingsMenu.classList.toggle('hide');
    }

    openMenu(buildType) {
        switch(buildType) {
            case "empty":
                this.openBuildMenu();
                break;
            case "altar_building":
                this.openAltarMenu();
                break;
            case "fuse_table":
                this.openFusionTableMenu();
                break;
            case "tower_building":
                this.openTowerMenu();
                break;
            case "mine_building":
                this.openMineMenu();
                break;
        }

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


    useSpell(spellCooldown, spellSlotIndex) {
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
