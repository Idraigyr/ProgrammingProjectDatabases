/**
 * Menu item class
 */
export class MenuItem{
    constructor(params) {
        this.id = params.id;
        this.name = params.name;
        this.display = "block";
        this.belongsIn = params.belongsIn;
        this.icon = new Image(params.icon.width,params.icon.height);
        this.icon.classList.add("menu-item-icon");
        this.icon.src = params.icon.src;
        this.element = this.createElement(params);
        this.element.classList.add("unlocked-menu-item");
    }

    /**
     * Render the menu item
     */
    render(){
        this.element.style.display = this.display;
    }

    /**
     * Hide the menu item
     */
    hide(){
        this.element.style.display = "none";
    }

    /**
     * Lock the menu item
     */
    lock(){
        this.element.classList.remove("unlocked-menu-item");
    }

    /**
     * Unlock the menu item
     */
    unlock(){
        this.element.classList.add("unlocked-menu-item");
    }

    /**
     * Detach the menu item from the parent
     */
    detach(){
        this.element.parentNode.removeChild(this.element);
    }

    /**
     * Attach the menu item to the parent
     * @param parent
     */
    attachTo(parent){
        parent.addChild("afterbegin", this);
    }

    /**
     * Create the menu item element
     * @param params - extra parameters
     * @returns {HTMLLIElement} - menu item element
     */
    createElement(params){
        const element = document.createElement("li");
        const description = document.createElement("div");
        const descriptionName = document.createElement("p");
        const descriptionText = document.createElement("p");
        description.classList.add("menu-item-description");
        descriptionName.classList.add("menu-item-description-name");
        descriptionText.classList.add("menu-item-description-text");
        description.appendChild(descriptionName);
        description.appendChild(descriptionText);
        element.id = this.id;
        element.classList.add("menu-item");
        element.draggable = true;
        element.appendChild(this.icon);
        element.appendChild(description);
        descriptionName.innerText = this.name;
        descriptionText.innerText = params?.description ?? "";
        return element;
    }

    /**
     * Get the type of the menu item
     * @returns {string} - type of the menu item
     */
    get type(){
        return "undefined";
    }
}

/**
 * Spell item class
 */
export class SpellItem extends MenuItem{
    constructor(params) {
        super(params);
        this.unlocked = params?.extra?.unlocked ?? false;
        this.element.draggable = params?.extra?.draggable ?? false;
        if(this.unlocked) this.unlock();
        else this.lock();
        this.display = "flex";
    }

    /**
     * Create the menu item element
     */
    render() {
        super.render();
    }

    /**
     * Attach the menu item to the parent
     * @param parent - parent element
     */
    attachTo(parent) {
        parent.addChild("beforeend", this);
    }

    /**
     * Lock the menu item
     */
    lock() {
        this.unlocked = false;
        this.element.draggable = false;
        this.element.classList.remove("unlocked-menu-item");
    }

    /**
     * Unlock the menu item
     */
    unlock(){
        this.unlocked = true;
        this.element.draggable = true;
        this.element.classList.add("unlocked-menu-item");
    }

    /**
     * Get the type of the menu item
     * @returns {string} - type of the menu item
     */
    get type(){
        return "Spell";
    }
}

/**
 * Gem item class
 */
export class GemItem extends MenuItem{
    constructor(params) {
        super(params);
        this.equipped = params?.equipped ?? false;
        this.slot = params?.slot ?? null;
    }

    /**
     * Create the menu item element
     * @param params - extra parameters
     * @returns {HTMLLIElement} - menu item element
     */
    createElement(params) {
        const element =  super.createElement(params);
        if(params?.equipped) element.style.opacity = "0.5";
        return element;
    }

    /**
     * Get the type of the menu item
     * @returns {string} - type of the menu item
     */
    get type(){
        return "Gem";
    }
}

/**
 * Building item class
 */
export class BuildingItem extends MenuItem{
    constructor(params) {
        super(params);
        this.element.classList.add("building-item");
        this.lock();
        this.element.draggable = false;
    }

    /**
     * Create the menu item element
     * @param params - extra parameters
     * @returns {HTMLLIElement} - menu item element
     */
    createElement(params) {
        const element = super.createElement(params);
        const descriptionName = element.querySelector(".menu-item-description-name");
        const descriptionText = element.querySelector(".menu-item-description-text");
        const placedDescription = document.createElement("p");
        placedDescription.classList.add("menu-item-description-placed");
        element.querySelector(".menu-item-description").appendChild(placedDescription);
        let description = "";
        // If there is this.extra.cost, add it to the name
        if(params?.extra?.cost) description += ` 💎 ${params.extra.cost}`;
        // If there is this.extra.buildTime, add it to the name
        if(params?.extra?.buildTime) description += ` ⌛ ${params.extra.buildTime}`;
        descriptionName.innerText += description;
        descriptionText.innerText = params?.description ?? "";
        //placedDescription.innerText = "placed: 0/0";
        return element;
    }

    /**
     * Get the type of the menu item
     * @returns {string} - type of the menu item
     */
    get type(){
        return "Building";
    }
}

/**
 * Combat building item class
 */
export class CombatBuildingItem extends BuildingItem{
    constructor(params) {
        super(params);
    }

    /**
     * Get the type of the menu item
     * @returns {string} - type of the menu item
     */
    get type(){
        return "CombatBuilding";
    }

}

/**
 * Resource building item class
 */
export class ResourceBuildingItem extends BuildingItem{
    constructor(params) {
        super(params);
    }

    /**
     * Get the type of the menu item
     * @returns {string} - type of the menu item
     */
    get type(){
        return "ResourceBuilding";
    }

}

/**
 * Decoration building item class
 */
export class DecorationBuildingItem extends BuildingItem{
    constructor(params) {
        super(params);
    }

    /**
     * Get the type of the menu item
     * @returns {string} - type of the menu item
     */
    get type(){
        return "DecorationBuilding";
    }

}

/**
 * Stat item class
 */
export class StatItem extends MenuItem{
    constructor(params) {
        super(params);
        this.element.draggable = false;
        this.display = "flex";
        this.value = 0;
    }

    /**
     * Create the menu item element
     * @returns {string} - type of the menu item
     */
    get type(){
        return "Stat";
    }
}