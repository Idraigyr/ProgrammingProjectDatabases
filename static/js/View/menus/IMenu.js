export class IMenu {
    constructor(params) {
        this.parent = params.parent;
        this.element = this.createElement(params);
        this.display = "block";
        this.allows = [];
    }

    createElement(params){
        const element = document.createElement("div");
        element.id = this.name;
        params.classes.forEach(c => element.classList.add(c));
        element.style.display = "none";
        element.draggable = false;
        element.innerText = this.name;
        return element;
    }

    addChild(position, child){
        if(!this.allows.includes(child.name)) {
            console.error(`${child.name} is not allowed in ${this.name}`);
            return;
        }
        this.element.insertAdjacentElement(position, child.element);
    }

    removeChild(child){
        try {
            this.element.removeChild(child.element);
        } catch (e) {
            console.error(e);
        }
    }

    render(){
        this.element.style.display = this.display;
    }

    hide(){
        this.element.style.display = "none";
    }

    get name(){
        return "Abstract Menu";
    }
}

export class ButtonsMenu extends IMenu{
    constructor(params) {
        params.classes = ["buttons-menu"];
        super(params);
        this.display = "flex";
    }

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

    get name(){
        return "ButtonsMenu";
    }
}

export class CollectMenu extends ButtonsMenu{
    constructor(params) {
        super(params);
    }

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

    get name(){
        return "CollectMenu";
    }

    get title(){
        return "Crystals";
    }

}

export class FuseInputMenu extends ButtonsMenu{
    constructor(params) {
        super(params);
    }

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

    get name(){
        return "FuseInputMenu";
    }

    get title(){
        return "Crystals";
    }

}

export class SlotMenu extends IMenu{
    constructor(params) {
        params.classes = ["slot-menu"];
        super(params);
        this.display = "flex";
    }

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
            slotDiv.appendChild(slot);
        }
        element.appendChild(slotDiv);
        element.id = this.name;
        params.classes.forEach(c => element.classList.add(c));
        element.style.display = "none";
        element.draggable = false;
        return element;
    }

    hide() {
        this.removeSlotIcons();
        super.hide();
    }

    //TODO: remove all icons from slots on hide
    removeSlotIcons(){
        this.element.querySelectorAll(".slot").forEach(slot => {
            slot.innerHTML = "";
        });
    }
    //TODO: add icons to slots on render depending on given params
    addSlotIcons(icons){
        icons.forEach((icon, i) => {
            this.addIcon(i, icon);
        });
    }

    addIcon(slot, icon){
        this.element.querySelector(`#slot-${slot}`).appendChild(icon);
    }

    get name(){
        return "SlotMenu";
    }

    get title(){
        return null;
    }
}

export class GemInsertMenu extends SlotMenu{
    constructor(params) {
        params.slots = 3;
        super(params);
        this.allows = ["Gem"];
    }
    //fake fem insert by just showing an image of the gem in the insert, don't move the gem element instead hide it in the gem menu

    get name(){
        return "GemInsertMenu";
    }

    get title(){
        return "Equipped";
    }

}

export class ListMenu extends IMenu{
    constructor(params) {
        params.classes = ["list-menu"];
        super(params);
        this.display = "flex";
        this.titleBar = this.element.querySelector(".list-menu-title-bar");
    }

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

    removeTitleBar(){
        this.element.removeChild(this.titleBar);
    }

    addTitleBar(){
        this.element.insertAdjacentElement("afterbegin", this.titleBar);
    }

    getTitleBar(){
        return this.titleBar;
    }

    findPrevious(item){
        //find the previous item in the list for inserting item after it
    }

    addChild(position, child){
        if(!this.allows.includes(child.type)) {
            console.error(`${child.name} is not allowed in ${this.name}`);
            return;
        }
        this.element.querySelector(".list-menu-ul").insertAdjacentElement(position, child.element);
    }

    get title(){
        return null;

    }
}

export class StatsMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["Stat"];
    }

    get name(){
        return "StatsMenu";
    }

    get title(){
        return "Stats";
    }
}

export class HotbarMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["Spell"];
    }

    get name(){
        return "HotbarMenu";
    }

    get title(){
        return "Hotbar";

    }
}

export class SpellsMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["Spell"];
    }

    get name(){
        return "SpellsMenu";
    }

    get title(){
        return "Spells";
    }
}

export class GemsMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["Gem"];
    }

    get name(){
        return "GemsMenu";
    }

    get title(){
        return "Gems";
    }
}

export class StakesMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["Gem"];
    }

    get name(){
        return "StakesMenu";
    }

    get title(){
        return "Stakes";

    }
}

export class CombatBuildingsMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["CombatBuilding"];
        this.removeTitleBar();
    }

    get name(){
        return "CombatBuildingsMenu";
    }

    get title(){
        return "Combat";

    }
}

export class ResourceBuildingsMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["ResourceBuilding"];
        this.removeTitleBar();
    }

    get name(){
        return "ResourceBuildingsMenu";
    }

    get title(){
        return "Resources";
    }
}

export class DecorationsMenu extends ListMenu{
    constructor(params) {
        super(params);
        this.allows = ["DecorationBuilding"];
        this.removeTitleBar();
    }

    get name(){
        return "DecorationsMenu";
    }

    get title(){
        return "Decorations";

    }
}

export class BaseMenu extends IMenu{
    constructor(params) {
        params.classes = ["base-menu"];
        super(params);
        this.display = "flex";
        this.allows = [];
    }

    addChild(position, child){
        if(!this.allows.includes(child.name)) {
            console.error(`${child.name} is not allowed in ${this.name}`);
            return;
        }
        this.element.querySelector(".sub-menu-container").insertAdjacentElement(position, child.element);
    }

    createElement(params){
        let element = document.createElement("div");
        const headerDiv = document.createElement("div");
        const title = document.createElement("h1");
        const closeButton = document.createElement("button");
        const subMenuDiv = document.createElement("div");
        headerDiv.classList.add("menu-header");
        title.classList.add("menu-title");
        title.innerText = this.title;
        subMenuDiv.classList.add("sub-menu-container");
        closeButton.classList.add("close-button");
        headerDiv.appendChild(title);
        headerDiv.appendChild(closeButton);
        element.appendChild(headerDiv);
        element.appendChild(subMenuDiv);
        element.id = this.name;
        params.classes.forEach(c => element.classList.add(c));
        element.style.display = "none";
        element.draggable = false;
        // element.innerText = this.name;
        return element;
    }

    get name(){
        return "BaseMenu";
    }

    get title(){
        return "Base";
    }

}


export class AltarMenu extends BaseMenu{
    constructor(params) {
        params.classes = ["altar-menu"];
        super(params);
        this.allows = ["SpellsMenu", "HotbarMenu", "GemsMenu", "StakesMenu"];
    }

    createElement(params){
        const element = super.createElement(params);
        const playButtonDiv = document.createElement("div");
        const playButton = document.createElement("button");
        playButtonDiv.classList.add("play-button-container");
        playButton.classList.add("play-button");
        //playButton.innerText = "Play";
        playButtonDiv.appendChild(playButton);
        const headerDiv = element.querySelector(".menu-header");
        headerDiv.insertAdjacentElement("afterend", playButtonDiv);
        return element;
    }

    get name(){
        return "AltarMenu";
    }

    get title(){
        return "Altar";

    }
}

export class TowerMenu extends BaseMenu{
    constructor(params) {
        params.classes = ["tower-menu"];
        super(params);
        this.allows = ["GemsMenu", "GemInsertMenu", "StatsMenu"];
    }

    get name(){
        return "TowerMenu";
    }

    get title(){
        return "Tower";
    }
}

export class MineMenu extends BaseMenu{
    constructor(params) {
        params.classes = ["mine-menu"];
        super(params);
        this.allows = ["GemsMenu", "GemInsertMenu", "StatsMenu", "CollectMenu"];
    }

    get name(){
        return "MineMenu";
    }

    get title(){
        return "Mine";
    }
}

export class FusionTableMenu extends BaseMenu{
    constructor(params) {
        params.classes = ["fusion-table-menu"];
        super(params);
        this.allows = ["FuseInputMenu", "GemsMenu", "GemInsertMenu", "StatsMenu"];
    }

    createElement(params){
        const element = super.createElement(params);
        const fuseButtonDiv = document.createElement("div");
        const fuseButton = document.createElement("button");
        fuseButtonDiv.classList.add("fuse-button-container");
        fuseButton.classList.add("fuse-button");
        //fuseButton.innerText = "Fuse";
        fuseButtonDiv.appendChild(fuseButton);
        const headerDiv = element.querySelector(".menu-header");
        headerDiv.insertAdjacentElement("afterend", fuseButtonDiv);
        return element;
    }

    get name(){
        return "FusionTableMenu";
    }

    get title(){
        return "Fusion Table";
    }
}

export class PageMenu extends IMenu{
    constructor(params) {
        params.classes = ["page-menu"];
        super(params);
        this.display = "flex";
        this.allows = [];
        this.params = null;
    }

    addChild(position, child){
        if(!this.allows.includes(child.name)) {
            console.error(`${child.name} is not allowed in ${this.name}`);
            return;
        }
        this.element.querySelector(".sub-menu-container").insertAdjacentElement(position, child.element);
    }


    createElement(params){
        let element = document.createElement("div");
        const headerDiv = document.createElement("div");
        const closeButton = document.createElement("button");
        const title = document.createElement("h1");
        const chooseSubMenuDiv = document.createElement("div");
        const subMenuDiv = document.createElement("div");
        headerDiv.classList.add("menu-header");
        closeButton.classList.add("close-button");
        title.classList.add("menu-title");
        title.innerText = this.title;
        chooseSubMenuDiv.classList.add("sub-menu-bookmark-container");
        subMenuDiv.classList.add("sub-menu-container");
        headerDiv.appendChild(title);
        headerDiv.appendChild(closeButton);
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

    get name(){
        return "PageMenu";
    }

    get title(){
        return "Page";
    }
}

export class BuildMenu extends PageMenu{
    constructor(params) {
        params.classes = ["build-menu"];
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

    get name(){
        return "BuildMenu";
    }

    get title(){
        return "Build";
    }
}