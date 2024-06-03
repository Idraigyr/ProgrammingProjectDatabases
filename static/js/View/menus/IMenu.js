import {assert} from "../../helpers.js";
import {multiplayerStats} from "../../configs/Enums.js";

/**
 * Abstract class for the menu
 */
export class IMenu {
    constructor(params) {
        this.parent = params.parent;
        this.element = this.createElement(params);
        this.display = "block";
        this.allows = [];
    }

    /**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params){
        const element = document.createElement("div");
        element.id = this.name;
        params.classes.forEach(c => element.classList.add(c));
        element.style.display = "none";
        element.draggable = false;
        element.innerText = this.name;
        return element;
    }

    /**
     * add a child to the menu at a certain position
     * @param {"afterbegin" | "beforeend" } position
     * @param child
     */
    addChild(position, child){
        if(!this.allows.includes(child.name)) {
            console.error(`${child.name} is not allowed in ${this.name}`);
            return;
        }
        if(position !== "afterbegin" && position !== "beforeend") throw new Error("Invalid position");
        this.element.insertAdjacentElement(position, child.element);
    }

    /**
     * Remove a child from the menu
     * @param child - child to remove
     */
    removeChild(child){
        try {
            this.element.removeChild(child.element);
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Render the menu
     */
    render(){
        this.element.style.display = this.display;
    }

    /**
     * Hide the menu
     */
    hide(){
        this.element.style.display = "none";
    }

    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "Abstract Menu";
    }
}

/**
 * Buttons menu with a title bar and buttons
 */
export class ButtonsMenu extends IMenu{
    constructor(params) {
        params.classes ? params.classes.push("buttons-menu") : params.classes = ["buttons-menu"];
        super(params);
        this.display = "flex";
    }

    /**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params){
        const element = document.createElement("div");
        const titleBar = document.createElement("h1");
        const buttonDiv = document.createElement("div");
        buttonDiv.classList.add("buttons-container");
        titleBar.classList.add("list-menu-title-bar");
        titleBar.innerText = this.title;
        element.appendChild(titleBar);
        element.appendChild(buttonDiv);
        element.id = this.name;
        params.classes.forEach(c => element.classList.add(c));
        element.style.display = "none";
        element.draggable = false;
        return element;
    }

    /**
     * Get the title of the menu
     * @returns {string} - title of the menu
     */
    get name(){
        return "ButtonsMenu";
    }
}

/**
 * Menu with buttons for the main menu
 */
export class CollectMenu extends ButtonsMenu{
    constructor(params) {
        super(params);
    }

    /**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params) {
        const element = super.createElement(params);
        const buttonDiv = element.querySelector(".buttons-container");
        const collectButton = document.createElement("button");
        const pickaxeDiv = document.createElement("div");
        const loadingBarContainer = document.createElement("div");
        const loadingBarDiv = document.createElement("div");
        const crystalAmountContainer = document.createElement("div");
        const crystalAmountDiv = document.createElement("div");
        const crystalAmountText = document.createElement("div");
        crystalAmountContainer.classList.add("crystal-meter-container");
        crystalAmountText.classList.add("crystal-meter-text");
        crystalAmountDiv.classList.add("crystal-meter"); //TODO: change css styling for this div so that it looks like a meter for the amount of crystals collected so far (+number in the middle of the meter), with this is loading-bar necessary?
        pickaxeDiv.classList.add("pickaxe");
        loadingBarContainer.classList.add("loading-bar-container");
        loadingBarDiv.classList.add("loading-bar");
        collectButton.innerText = "Collect";
        crystalAmountText.innerText = "0";
        collectButton.classList.add("collect-button");
        buttonDiv.appendChild(collectButton);
        buttonDiv.appendChild(pickaxeDiv);
        buttonDiv.appendChild(loadingBarContainer);
        loadingBarContainer.appendChild(loadingBarDiv);
        crystalAmountContainer.appendChild(crystalAmountDiv);
        crystalAmountContainer.appendChild(crystalAmountText);
        buttonDiv.appendChild(crystalAmountContainer);

        return element;
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "CollectMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Crystals";
    }

}

/**
 * Menu for the input with amount of crystals to add or remove
 */
export class FuseInputMenu extends ButtonsMenu{
    constructor(params) {
        super(params);
    }
/**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params) {
        const element = super.createElement(params);
        const buttonDiv = element.querySelector(".buttons-container");
        const addButton = document.createElement("button");
        const removeButton = document.createElement("button");
        const arrowDiv = document.createElement("div");
        const loadingBarContainer = document.createElement("div");
        const loadingBarDiv = document.createElement("div");
        const crystalAmountContainer = document.createElement("div");
        const crystalAmountDiv = document.createElement("div");
        const crystalAmountText = document.createElement("div");
        crystalAmountContainer.classList.add("crystal-meter-container");
        crystalAmountText.classList.add("crystal-meter-text");
        crystalAmountDiv.classList.add("crystal-meter"); //TODO: change css styling for this div so that it looks like a meter for the amount of crystals collected so far (+number in the middle of the meter), with this is loading-bar necessary?
        arrowDiv.classList.add("arrow");
        loadingBarContainer.classList.add("loading-bar-container");
        loadingBarDiv.classList.add("loading-bar");
        addButton.innerText = "Add crystals";
        removeButton.innerText = "Remove crystals";
        crystalAmountText.innerText = "0";
        addButton.classList.add("add-button");
        removeButton.classList.add("remove-button");
        buttonDiv.appendChild(addButton);
        buttonDiv.appendChild(removeButton);
        buttonDiv.appendChild(arrowDiv);
        buttonDiv.appendChild(loadingBarContainer);
        loadingBarContainer.appendChild(loadingBarDiv);
        crystalAmountContainer.appendChild(crystalAmountDiv);
        crystalAmountContainer.appendChild(crystalAmountText);
        buttonDiv.appendChild(crystalAmountContainer);

        return element;
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "FuseInputMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Crystals";
    }

}

/**
 * Slot menu (e.g. for equipped gems)
 */
export class SlotMenu extends IMenu{
    constructor(params) {
        params.classes ? params.classes.push("slot-menu") : params.classes = ["slot-menu"];
        super(params);
        this.display = "flex";
        this.slots = params?.slots ?? 0;
        this.visibleSlots = 0;
    }
    /**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params){
        const element = document.createElement("div");
        const titleBar = document.createElement("h1");
        const slotDiv = document.createElement("div");
        slotDiv.classList.add("slot-container");
        titleBar.classList.add("list-menu-title-bar");
        titleBar.innerText = this.title;
        element.appendChild(titleBar);
        // add a certain amount of slot numbers from params
        for(let i = 0; i < params.slots; i++){
            const slot = document.createElement("div");
            slot.classList.add("slot");
            slot.dataset.menu = this.name;
            slot.id = `slot-${i}`;
            slot.style.display = "none";
            slotDiv.appendChild(slot);
        }
        element.appendChild(slotDiv);
        element.id = this.name;
        params.classes.forEach(c => element.classList.add(c));
        element.style.display = "none";
        element.draggable = false;
        return element;
    }

    /**
     * Show the menu
     */
    hide() {
        this.removeSlotIcons();
        super.hide();
    }

    /**
     * Renders a certain amount of slots or throws an error if the amount is too high
     * assert(amount <= this.slots, "Too many slots for the amount of slots")
     * @param amount
     */
    renderSlots(amount){
        assert(amount <= this.slots, "Too many slots for the amount of slots")
        this.visibleSlots = amount;
        for(let i = 0; i < this.slots; i++){
            this.element.querySelector(`#slot-${i}`).style.display = i < amount ? "flex" : "none";
        }
    }

    /**
     * Remove all icons from slots
     */
    //TODO: remove all icons from slots on hide
    removeSlotIcons(){
        this.element.querySelectorAll(".slot").forEach(slot => {
            slot.innerHTML = "";
        });
    }
    //TODO: add icons to slots on render depending on given params
    /**
     * Add icons to slots
     * @param icons - icons to add
     */
    addSlotIcons(icons){
        assert(icons.length <= this.slots, "Too many icons for the amount of slots");
        icons.forEach((icon, i) => {
            this.addIcon(i, icon);
        });
    }

    /**
     * Add an icon to a slot
     * @param slot - slot number
     * @param icon - icon to add
     */
    addIcon(slot, icon){
        this.element.querySelector(`#slot-${slot}`).appendChild(icon);
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "SlotMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return null;
    }
}

export class GemInsertMenu extends SlotMenu{
    /**
     * Constructor for the GemInsertMenu which is a SlotMenu with 3 slots
     * @param params
     */
    constructor(params) {
        params.slots = 3;
        super(params);
        this.allows = ["Gem"];
    }

    get name(){
        return "GemInsertMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Equipped";
    }

}

/**
 * Menu with a title bar and a list
 */
export class ListMenu extends IMenu{
    constructor(params) {
        params.classes ? params.classes.push("list-menu") : params.classes = ["list-menu"];
        super(params);
        this.display = "flex";
        this.titleBar = this.element.querySelector(".list-menu-title-bar");
    }
    /**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params){
        const element = document.createElement("div");
        const titleBar = document.createElement("h1");
        const list = document.createElement("ul");
        titleBar.classList.add("list-menu-title-bar");
        titleBar.innerText = this.title;
        list.classList.add("list-menu-ul");
        list.dataset.menu = this.name;
        list.id = `${this.name}-list`
        element.appendChild(titleBar);
        element.appendChild(list);
        element.id = this.name;
        params.classes.forEach(c => element.classList.add(c));
        element.style.display = "none";
        element.draggable = false;
        return element;
    }

    /**
     * Remove the title bar from the menu
     */
    removeTitleBar(){
        this.element.removeChild(this.titleBar);
    }

    /**
     * Add the title bar to the menu
     */
    addTitleBar(){
        this.element.insertAdjacentElement("afterbegin", this.titleBar);
    }

    /**
     * Get the title bar of the menu
     * @returns {*} - title bar of the menu
     */
    getTitleBar(){
        return this.titleBar;
    }

    /**
     * Find the next item in the list for inserting item after it
     * @param item
     */
    findPrevious(item){

    }

    /**
     * Add a child to the menu at a certain position
     * @param position - position to add the child
     * @param child - child to add
     */
    addChild(position, child){
        if(!this.allows.includes(child.type)) {
            console.error(`${child.name} is not allowed in ${this.name}`);
            return;
        }
        this.element.querySelector(".list-menu-ul").insertAdjacentElement(position, child.element);
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return null;

    }
}

/**
 * Menu for the stats
 */
export class StatsMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["Stat"];
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "StatsMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Stats";
    }
}

/**
 * Menu for the spells
 */
export class HotbarMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["Spell"];
    }

    /**
     * Get the ids of the spells in the hotbar
     * @param {number} spellId
     * @param {boolean} equip - if the spell is being equipped or unequipped
     * @return {string[]}
     */
    getEquippedSpellIds(spellId, equip){
        const arr = Array.from(this.element.querySelectorAll(".list-menu-ul > li")).map(spell => spell.id);
        const index = arr.indexOf(spellId);
        if(index !== -1){
            arr.splice(arr.indexOf(spellId), 1);
        }
        if(equip) arr.push(spellId);
        return arr;
    }

    get name(){
        return "HotbarMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Hotbar";

    }
}

/**
 * Menu for the spells
 */
export class SpellsMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["Spell"];
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "SpellsMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Spells";
    }
}

/**
 * Menu for gem list
 */
export class GemsMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["Gem"];
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "GemsMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Gems";
    }
}

/**
 * Menu for the multiplayer gems]
 */
export class MultiplayerGemsMenu extends GemsMenu{
    constructor(params) {
        params.classes ? params.classes.push("multiplayer-gems-menu") : params.classes = ["multiplayer-gems-menu"];
        super(params);
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "MultiplayerGemsMenu";
    }

    /**
     * Set the title of the menu based on the result of the match
     * @param {"win" | "lose" | "draw"} result
     */
    setTitle(result){
        if(result === "win"){
            this.getTitleBar().innerText = "Won";
        } else if(result === "lose"){
            this.getTitleBar().innerText = "Lost";
        } else if(result === "draw"){
            this.getTitleBar().innerText = "Got back";
        }

    }

    /**
     * Hide the menu
     */
    hide(){
        this.element.style.display = "none";
        this.getTitleBar().innerText = this.title;
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Gems";
    }

}

/**
 * Menu for the stakes
 */
export class StakesMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["Gem"];
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "StakesMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Stakes";

    }
}

/**
 * Menu for combat buildings
 */
export class CombatBuildingsMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["CombatBuilding"];
        this.removeTitleBar();
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "CombatBuildingsMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Combat";

    }
}

/**
 * Menu for resource buildings
 */
export class ResourceBuildingsMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["ResourceBuilding"];
        this.removeTitleBar();
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "ResourceBuildingsMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Resources";
    }
}

/**
 * Menu for decoration buildings
 */
export class DecorationsMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["DecorationBuilding"];
        this.removeTitleBar();
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "DecorationsMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Decorations";

    }
}

/**
 * Base class for menus of a building
 */
export class BaseMenu extends IMenu{
    constructor(params) {
        params.classes ? params.classes.push("base-menu") : params.classes = ["base-menu"];
        super(params);
        this.display = "flex";
        this.allows = [];
    }

    /**
     * Add a child to the menu at a certain position
     * @param position - position to add the child
     * @param child - child to add
     */
    addChild(position, child){
        if(!this.allows.includes(child.name)) {
            console.error(`${child.name} is not allowed in ${this.name}`);
            return;
        }
        this.element.querySelector(".sub-menu-container").insertAdjacentElement(position, child.element);
    }
    /**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params){
        let element = document.createElement("div");
        const headerDiv = document.createElement("div");
        const titleDiv = document.createElement("div");
        const title = document.createElement("h1");
        const closeButtonDiv = document.createElement("div");
        const closeButton = document.createElement("button");
        const subMenuDiv = document.createElement("div");
        headerDiv.classList.add("menu-header");
        closeButtonDiv.classList.add("close-button-container");
        titleDiv.classList.add("menu-title-container");
        title.classList.add("menu-title");
        title.innerText = this.title;
        subMenuDiv.classList.add("sub-menu-container");
        closeButton.classList.add("close-button");
        closeButtonDiv.appendChild(closeButton);
        headerDiv.appendChild(titleDiv);
        headerDiv.appendChild(closeButtonDiv);
        titleDiv.appendChild(title);
        element.appendChild(headerDiv);
        element.appendChild(subMenuDiv);
        element.id = this.name;
        params.classes.forEach(c => element.classList.add(c));
        element.style.display = "none";
        element.draggable = false;
        // element.innerText = this.name;
        return element;
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "BaseMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Base";
    }

}

/**
 * Menu of a prop
 */
export class PropMenu extends BaseMenu{
    constructor(params) {
        params.classes ? params.classes.push("prop-menu") : params.classes = ["prop-menu"];
        super(params);
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "PropMenu";
    }
    /**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params) {
        const element = super.createElement(params);
        const deleteButton = document.createElement("button");
        const deleteButtonDiv = document.createElement("div");
        deleteButton.classList.add("delete-button");
        // Add title to the button
        deleteButton.title = "Vanish this";
        deleteButtonDiv.appendChild(deleteButton);
        deleteButtonDiv.classList.add("delete-button-container");
        const headerDiv = element.querySelector(".menu-header");
        headerDiv.insertBefore(deleteButtonDiv, headerDiv.lastChild);
        return element;
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Decoration";
    }
}

/**
 * Menu for the multiplayer
 */
export class MultiplayerMenu extends BaseMenu{
    constructor(params) {
        params.classes ? params.classes.push("multiplayer-menu") : params.classes = ["multiplayer-menu"];
        super(params);
        this.allows = ["MultiplayerStatsMenu", "MultiplayerGemsMenu"];
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "MultiplayerMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Results";

    }
}

/**
 * Menu for the multiplayer stats
 */
export class MultiplayerStatsMenu extends IMenu{
    #stats;
    constructor(params) {
        params.classes ? params.classes.push("multiplayer-stats-menu") : params.classes = ["multiplayer-stats-menu"];
        super(params);
        this.allows = [];
        this.#stats = {
            current: null,
            lifetime: null
        }
    }
    /**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params){
        const element = document.createElement("div");
        const statsDiv = document.createElement("div");
        const buttonContainer = document.createElement("div");
        const matchButton = document.createElement("button");
        const lifetimeButton = document.createElement("button");
        const list = document.createElement("ul");
        buttonContainer.classList.add("multiplayer-stats-menu-button-container");
        matchButton.classList.add("multiplayer-stats-menu-button");
        lifetimeButton.classList.add("multiplayer-stats-menu-button");
        statsDiv.classList.add("multiplayer-stats-menu-container");
        list.classList.add("multiplayer-stats-menu-ul");
        matchButton.innerText = "Match";
        lifetimeButton.innerText = "Lifetime";
        list.dataset.menu = this.name;
        matchButton.id = "multiplayer-match-button";
        lifetimeButton.id = "multiplayer-lifetime-button";
        list.id = `${this.name}-list`
        buttonContainer.appendChild(matchButton);
        buttonContainer.appendChild(lifetimeButton);
        buttonContainer.addEventListener("click", this.toggleStats.bind(this));
        statsDiv.appendChild(buttonContainer);
        for(const key of multiplayerStats.getKeys()){
            const statElement = document.createElement("li");
            statElement.id = key;
            statElement.classList.add("multiplayer-stats-menu-li");
            statElement.innerText = `${key}: 0`;
            list.appendChild(statElement);
        }
        element.appendChild(statsDiv);
        statsDiv.appendChild(list);
        element.id = this.name;
        params.classes.forEach(c => element.classList.add(c));
        element.style.display = "none";
        element.draggable = false;
        return element;
    }

    /**
     * Set the stats of the menu
     * @param {{current: {name: string, value, number}[], lifetime: {name: string, value, number}[]}} stats
     */
    setStats(stats){

        this.#stats.current = stats.current;
        this.#stats.lifetime = stats.lifetime;
    }

    /**
     * callback for the button click event to toggle between match and lifetime stats
     * @param {{target: HTMLElement}} e
     */
    toggleStats(e){
        console.log("toggling stats")
        const matchButton = this.element.querySelector("#multiplayer-match-button");
        const lifetimeButton = this.element.querySelector("#multiplayer-lifetime-button");
        let stats = null;
        if(e.target === matchButton) {
            matchButton.classList.add("active");
            lifetimeButton.classList.remove("active");
            stats = this.#stats.current;
        } else if (e.target === lifetimeButton){
            lifetimeButton.classList.add("active");
            matchButton.classList.remove("active");
            stats = this.#stats.lifetime;
        }
        for(const stat of stats){
                const list = this.element.querySelector(".multiplayer-stats-menu-ul");
                const statElement = list.querySelector(`#${stat.key}`);
                statElement.innerText = `${stat.name}: ${stat.value}`;
            }
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "MultiplayerStatsMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Stats";
    }
}

/**
 * Base class for building menus
 */
export class BuildingMenu extends PropMenu{
    constructor(params) {
        params.classes ? params.classes.push("building-menu") : params.classes = ["building-menu"];
        super(params);
        this.allows = [];
    }
    /**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params){
        const element = super.createElement(params);
        // element.classList.remove("base-menu");
        const lvlUpButtonDiv = document.createElement("div");
        const lvlUpButton = document.createElement("button");
        lvlUpButtonDiv.classList.add("lvl-up-button-container");
        lvlUpButton.classList.add("lvl-up-button");
        lvlUpButton.innerText = "lvl 0 → 0 \n 💎 0 ⌛ 0";
        lvlUpButtonDiv.appendChild(lvlUpButton);
        element.querySelector(".menu-header").insertAdjacentElement("afterbegin" , lvlUpButtonDiv);
        return element;
    }

    /**
     * Update the level up button with the new level, cost and time
     * @param params - parameters for the level up button
     */
    updateLvlUpButton(params){
        const lvlUpButton = this.element.querySelector(".lvl-up-button");
        if(params.currentLevel === params.newLevel){
            lvlUpButton.classList.add("inactive");
            params.upgradeCost = 0;
            params.upgradeTime = 0;
        } else {
            lvlUpButton.classList.remove("inactive");
        }
        this.element.querySelector(".lvl-up-button").innerText = `lvl ${params.currentLevel} → ${params.newLevel} \n 💎 ${params.upgradeCost} ⌛ ${params.upgradeTime}`;
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "BuildingMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Building";

    }
}

/**
 * Menu for the altar
 */
export class AltarMenu extends BaseMenu{
    constructor(params) {
        params.classes ? params.classes.push("altar-menu") : params.classes = ["altar-menu"];
        super(params);
        this.allows = ["SpellsMenu", "HotbarMenu", "GemsMenu", "StakesMenu"];
    }
    /**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params){
        const element = super.createElement(params);
        const playButtonDiv = document.createElement("div");
        const playButton = document.createElement("button");
        playButtonDiv.classList.add("play-button-container");
        playButtonDiv.classList.add("inactive");
        playButton.classList.add("play-button");
        //playButton.innerText = "Play";
        playButtonDiv.appendChild(playButton);
        const headerDiv = element.querySelector(".menu-header");
        headerDiv.insertAdjacentElement("afterend", playButtonDiv);
        return element;
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "AltarMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Altar";

    }
}

/**
 * Menu for the tower
 */
export class TowerMenu extends BuildingMenu{
    constructor(params) {
        params.classes ? params.classes.push("tower-menu") : params.classes = ["tower-menu"];
        super(params);
        this.allows = ["GemsMenu", "GemInsertMenu", "StatsMenu"];
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "TowerMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Tower";
    }
}

/**
 * Menu for the mine
 */
export class MineMenu extends BuildingMenu{
    constructor(params) {
        params.classes ? params.classes.push("mine-menu") : params.classes = ["mine-menu"];
        super(params);
        this.allows = ["GemsMenu", "GemInsertMenu", "StatsMenu", "CollectMenu"];
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "MineMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Mine";
    }
}

/**
 * Menu for the fusion table
 */
export class FusionTableMenu extends BuildingMenu{
    constructor(params) {
        params.classes ? params.classes.push("fusion-table-menu") : params.classes = ["fusion-table-menu"];
        super(params);
        this.allows = ["FuseInputMenu", "GemsMenu", "GemInsertMenu", "StatsMenu"];
    }
    /**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params){
        const element = super.createElement(params);
        const fuseButtonDiv = document.createElement("div");
        const fuseButton = document.createElement("button");
        fuseButtonDiv.classList.add("fuse-button-container");
        fuseButton.classList.add("fuse-button");
        fuseButton.innerText = "Fuse ✨";
        fuseButtonDiv.appendChild(fuseButton);
        const headerDiv = element.querySelector(".menu-header");
        headerDiv.insertAdjacentElement("afterend", fuseButtonDiv);
        return element;
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "FusionTableMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Fusion Table";
    }
}

/**
 * Page menu class
 */
export class PageMenu extends IMenu{
    constructor(params) {
        params.classes ? params.classes.push("page-menu") : params.classes = ["page-menu"];
        super(params);
        this.display = "flex";
        this.allows = [];
        this.params = null;
    }

    /**
     * Add a child to the menu at a certain position
     * @param position - position to add the child
     * @param child - child to add
     */
    addChild(position, child){
        if(!this.allows.includes(child.name)) {
            console.error(`${child.name} is not allowed in ${this.name}`);
            return;
        }
        this.element.querySelector(".sub-menu-container").insertAdjacentElement(position, child.element);
    }

    /**
     * Create the element for the menu
     * @param params - parameters for the element
     * @returns {HTMLDivElement} - menu element
     */
    createElement(params){
        let element = document.createElement("div");
        const headerDiv = document.createElement("div");
        const titleDiv = document.createElement("div");
        const closeButtonDiv = document.createElement("div");
        const closeButton = document.createElement("button");
        const title = document.createElement("h1");
        const chooseSubMenuDiv = document.createElement("div");
        const subMenuDiv = document.createElement("div");
        closeButtonDiv.classList.add("close-button-container");
        titleDiv.classList.add("menu-title-container");
        headerDiv.classList.add("menu-header");
        closeButton.classList.add("close-button");
        title.classList.add("menu-title");
        title.innerText = this.title;
        chooseSubMenuDiv.classList.add("sub-menu-bookmark-container");
        subMenuDiv.classList.add("sub-menu-container");
        titleDiv.appendChild(title);
        closeButtonDiv.appendChild(closeButton);
        headerDiv.appendChild(titleDiv);
        headerDiv.appendChild(closeButtonDiv);
        element.appendChild(headerDiv);
        element.appendChild(chooseSubMenuDiv);
        element.appendChild(subMenuDiv);
        element.id = this.name;
        params.classes.forEach(c => element.classList.add(c));
        element.style.display = "none";
        element.draggable = false;
        // element.innerText = this.name;
        return element;
    }
    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "PageMenu";
    }
    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Page";
    }
}

/**
 * Menu choose a building to build
 */
export class BuildMenu extends PageMenu{
    constructor(params) {
        params.classes ? params.classes.push("build-menu") : params.classes = ["build-menu"];
        super(params);
        this.allows = ["CombatBuildingsMenu", "ResourceBuildingsMenu", "DecorationsMenu"];
        this.params = {
            display: {
                "CombatBuildingsMenu": "flex",
                "ResourceBuildingsMenu": "flex",
                "DecorationsMenu": "flex"
            }
        };
    }

    /**
     * Render the menu
     */
    render() {
        this.element.querySelector(".sub-menu-container").childNodes.forEach((child, i) => {
            if(i === 0){
                child.style.display = this.params.display[child.dataset.name];
            } else {
                child.style.display = "none";
            }
        });
        super.render();
    }

    /**
     * Create the menu element
     * @param params - parameters for the element
     * @returns {HTMLDivElement}
     */
    createElement(params) {
        const element = super.createElement(params);
        const combatButton = document.createElement("button");
        const resourceButton = document.createElement("button");
        const decorationButton = document.createElement("button");
        combatButton.innerText = "Combat";
        resourceButton.innerText = "Resources";
        decorationButton.innerText = "Decorations";
        combatButton.id = "combat-button";
        resourceButton.id = "resource-button";
        decorationButton.id = "decoration-button";
        combatButton.dataset.name = "CombatBuildingsMenu";
        resourceButton.dataset.name = "ResourceBuildingsMenu";
        decorationButton.dataset.name = "DecorationsMenu";
        combatButton.classList.add("bookmark-button");
        resourceButton.classList.add("bookmark-button");
        decorationButton.classList.add("bookmark-button");
        element.querySelector(".sub-menu-bookmark-container").appendChild(combatButton);
        element.querySelector(".sub-menu-bookmark-container").appendChild(resourceButton);
        element.querySelector(".sub-menu-bookmark-container").appendChild(decorationButton);

        return element;
    }

    /**
     * Get the name of the menu
     * @returns {string} - name of the menu
     */
    get name(){
        return "BuildMenu";
    }

    /**
     * Get title of the menu
     * @returns {string} - title of the menu
     */
    get title(){
        return "Build";
    }
}