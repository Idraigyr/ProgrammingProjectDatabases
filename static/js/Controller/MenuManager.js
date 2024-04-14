import {
    AltarMenu,
    BaseMenu,
    BuildMenu, CollectMenu, CombatBuildingsMenu, DecorationsMenu, FusionTableMenu, GemInsertMenu, GemsMenu,
    HotbarMenu,
    ListMenu, MineMenu,
    PageMenu, ResourceBuildingsMenu,
    SlotMenu,
    SpellsMenu, StakesMenu, StatsMenu, TowerMenu
} from "../View/menus/IMenu.js";
import {
    BuildingItem,
    CombatBuildingItem,
    DecorationBuildingItem,
    GemItem,
    ResourceBuildingItem,
    SpellItem,
    StatItem
} from "../View/menus/MenuItem.js";
import {Subject} from "../Patterns/Subject.js";

export class MenuManager extends Subject{
    constructor(params) {
        super();
        this.container = params.container;
        this.blockInputCallback = params.blockInputCallback;
        this.items = {};
        this.menus = {};

        this.currentMenu = null;
        this.dragElement = null;
        this.isSlotItem = false;
        this.dropElement = null;
        this.slot = null;

        this.container.addEventListener("dragstart", this.drag.bind(this));
        this.container.addEventListener("dragend", this.dragend.bind(this));
    }

    #addMenuCallbacks(menu){
        if(menu instanceof BaseMenu){
            menu.element.querySelector(".close-button").addEventListener("click", this.exitMenu.bind(this));
        }
        if(menu instanceof AltarMenu){
            menu.element.querySelector(".play-button").addEventListener("click", () => console.log("play button clicked"));
        }
        if(menu instanceof ListMenu){
            menu.element.addEventListener("drop", this.drop.bind(this));
            menu.element.addEventListener("dragover", this.dragover.bind(this));
        }
        if(menu instanceof SlotMenu){
            menu.element.querySelectorAll(".slot").forEach(slot => slot.addEventListener("drop", this.dropInSlot.bind(this)));
            menu.element.querySelectorAll(".slot").forEach(slot => slot.addEventListener("dragover", this.dragoverSlot.bind(this)));
        }
        if(menu instanceof PageMenu){
            menu.element.querySelector(".close-button").addEventListener("click", this.exitMenu.bind(this));
            menu.element.querySelectorAll(".bookmark-button").forEach(button => button.addEventListener("click", this.switchPage.bind(this)));
        }
        if(menu instanceof BuildMenu){
            menu.element.querySelector(".sub-menu-container").addEventListener("click", this.dispatchBuildEvent.bind(this));
        }
        if(menu instanceof CollectMenu){
            menu.element.querySelector(".collect-button").addEventListener("click", this.dispatchCollectEvent.bind(this));
        }
        //if(menu instanceof FusionTableMenu){
        //    menu.element.querySelector(".fuse-button").addEventListener("click", () => console.log("fuse button clicked"));
        //}
    }

    exitMenu(){
        //if the menu is the AltarMenu, return all gems from stakes menu to gems menu
        this.hideMenu(this.currentMenu);
    }
    

    switchPage(event){
        this.menus[this.currentMenu].allows.forEach(child => {
            if(child === event.target.dataset.name){
                this.menus[child].render();
            } else {
                this.menus[child].hide();
            }
        });
    }

    createAddGemEvent(){
        return new CustomEvent("addGem", {
            detail: {
                id: this.dragElement
            }
        });
    }

    createRemoveGemEvent(){
        return new CustomEvent("removeGem", {
            detail: {
                id: this.dragElement
            }
        });
    }

    createCollectEvent() {
        return new CustomEvent("collect");
    }

    createBuildEvent(buildingId){
        return new CustomEvent("build", {
            detail: {
                id: buildingId
            }
        });
    }

    dispatchBuildEvent(event){
        if(event.target.classList.contains("build-item")){
            this.dispatchEvent(this.createBuildEvent(event.target.id));
        }
    }

    dispatchCollectEvent(event){
        console.log("Collecting resources");
        this.dispatchEvent(this.createCollectEvent());
    }

    drag(event){
        let id = event.target.id;
        this.isSlotItem = event.target.classList.contains("slot-item")
        if(this.isSlotItem) {
            this.slot = event.target.id.substring(event.target.id.lastIndexOf("-")+1);
            id  = event.target.dataset.itemId;
        }

        event.dataTransfer.clearData();
        event.dataTransfer.setDragImage(this.items[id].icon, 0, 0);

        if(!this.isSlotItem && this.items[id]?.equipped) return;
        this.items[id].element.style.opacity = 0.5;
        this.dragElement = id;
    }

    dragend(event){
        if(!this.dragElement) return;
        if (!this.isSlotItem && !this.items[this.dragElement]?.equipped) {
            this.items[this.dragElement].element.style.opacity = 1;
        }
        this.dragElement = null;
        this.dropElement = null;
    }

    getParentMenuByClass(element, className){
        let parent = element;
        while(true){
            if(parent.classList.contains(className)){
                return parent;
            } else if(parent === this.container){
                return null;
            } else {
                parent = parent.parentNode;
            }
        }
    }

    //is this optimised? can we do better?
    dragover(event){
        if(!this.dragElement) return;
        this.dropElement = this.getParentMenuByClass(event.target, "list-menu").id;
        if(!(this.dropElement)) return;
        if(this.menus[this.dropElement].allows.includes(this.items[this.dragElement].type)) {
            event.preventDefault();
        }
    }

    drop(event){
        event.preventDefault();
        if(this.isSlotItem){
            this.dispatchEvent(this.createRemoveGemEvent());
            this.menus["GemInsertMenu"].element.querySelector(`#slot-${this.slot}`).innerHTML = "";
            this.items[this.dragElement].equipped = false;
            this.items[this.dragElement].slot = null;
            this.items[this.dragElement].element.style.opacity = 1;
            this.slot = null;
        }
        this.items[this.dragElement].attachTo(this.menus[this.dropElement]);
    }

    dragoverSlot(event){
        if(!this.dragElement) return;
        this.dropElement = this.getParentMenuByClass(event.target, "slot-menu").id;
        if(this.items[this.dragElement]?.equipped) return;
        if(this.menus[this.dropElement].allows.includes(this.items[this.dragElement].type) && event.target.classList.contains("slot")){
            event.preventDefault();
            this.slot = event.target.id.substring(event.target.id.lastIndexOf("-")+1);
        }
    }

    createSlotIcon(params){
        const element = document.createElement("img");
        element.src = params.src;
        element.id = params.id;
        element.dataset.itemId = params.itemId;
        element.classList.add("slot-item");
        element.draggable = true;
        return element;
    }

    //TODO: add line that says in what building it is in
    dropInSlot(event){
        event.preventDefault();
        this.menus[this.dropElement].addIcon(this.slot, this.createSlotIcon({
            id: `slot-icon-${this.slot}`,
            itemId: this.items[this.dragElement].id,
            src: this.items[this.dragElement].icon.src
        }));
        this.items[this.dragElement].element.style.opacity = 0.5;
        this.items[this.dragElement].equipped = true;
        this.items[this.dragElement].slot = this.slot;
        this.slot = null;
        this.dispatchEvent(this.createAddGemEvent());
    }

    addItems(items){
        for(const item of items){
            this.addItem(item);
        }
    }

    addItem(params){
        const menuItem = this.#createMenuItem({
            id: params.item.getItemId(),
            name: params.item.getDisplayName(),
            belongsIn: params.item.belongsIn,
            icon: params.icon
        });

        if(menuItem instanceof BuildingItem){
            menuItem.element.addEventListener("click", () => this.dispatchEvent(this.createBuildEvent(menuItem.id)));
        }

        this.#addItemToMenu(menuItem);
        this.items[params.item.getItemId()] = menuItem;
    }

    #addItemToMenu(item){
        this.menus[item.belongsIn].addChild("afterbegin", item);
    }

    //untested
    removeItem(itemId){
        this.items = this.items.filter(i => {
            if(i.id === itemId){
                i.detach();
                return false;
            }
            return true;
        });
    }

    //untested
    moveItem(itemId, fromMenu, toMenu){
        this.items.forEach(i => {
            if(i.id === itemId){
                i.attachTo(toMenu);
            }
        });
    }

    #moveMenu(child, parent, position){
        if(position !== "afterbegin" && position !== "beforeend") return false;
        this.menus[parent].addChild(position, this.menus[child]);
    }

    #createMenuItem(item){
        if(item.belongsIn === "SpellsMenu"){
            return new SpellItem(item);
        } else if (item.belongsIn === "GemsMenu"){
            return new GemItem(item);
        } else if (item.belongsIn === "StatsMenu"){
            return new StatItem(item);
        } else if (item.belongsIn === "CombatBuildingsMenu"){
            return new CombatBuildingItem(item);
        } else if (item.belongsIn === "ResourceBuildingsMenu"){
            return new ResourceBuildingItem(item);
        } else if (item.belongsIn === "DecorationsMenu"){
            return new DecorationBuildingItem(item);
        }
        return null;
    }

    #createStatMenuItems(){
        const stats = [];
        for(const stat in stats){
            this.items[stat.id] = new StatItem(stat);
        }
    }

    #createBuildingItems(){
        const items = [
            {
                item: {name: "tower", id: 0, belongsIn: "CombatBuildingsMenu", getItemId: () => "Tower", getDisplayName: () => "Tower"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
            },
            {
                item: {name: "tree", id: 1, belongsIn: "DecorationsMenu", getItemId: () => "Tree", getDisplayName: () => "Tree"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
            },
            {
                item: {name: "bush", id: 2, belongsIn: "DecorationsMenu", getItemId: () => "Bush", getDisplayName: () => "Bush"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
            },
            {
                item: {name: "mine", id: 3, belongsIn: "ResourceBuildingsMenu", getItemId: () => "Mine", getDisplayName: () => "Mine"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
            },
            {
                item: {name: "fusion table", id: 4, belongsIn: "ResourceBuildingsMenu", getItemId: () => "FusionTable", getDisplayName: () => "Fusion table"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
            },
            {
                item: {name: "warrior hut", id: 5, belongsIn: "CombatBuildingsMenu", getItemId: () => "WarriorHut", getDisplayName: () => "Warrior hut"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
            }
        ];
        this.addItems(items);
    }

    #createMenu(ctor){
        const menu = new ctor({parent: this});
        if(this.menus[menu.name]) return false;

        this.#addMenuCallbacks(menu);

        this.menus[menu.name] = menu;
        this.container.appendChild(this.menus[menu.name].element);
        return true;
    }

    #createMenus(ctorList){
        ctorList.forEach(ctor => this.#createMenu(ctor));
    }

    //TODO: refactor this? maybe make create MenuItems less hard coded/more dynamic
    createMenus(){
        this.#createMenus([SpellsMenu, HotbarMenu, GemsMenu, StakesMenu, AltarMenu, GemInsertMenu, StatsMenu, TowerMenu, MineMenu, FusionTableMenu, CombatBuildingsMenu, ResourceBuildingsMenu, DecorationsMenu, BuildMenu, CollectMenu]);
        this.#createStatMenuItems();
        this.#createBuildingItems();
    }

    renderMenu(params){
        if(!params.name) return;
        if(this.currentMenu) this.hideMenu(this.currentMenu);
        this.blockInputCallback.block();
        this.container.style.display = "block";
        this.currentMenu = params.name;
        this.#arrangeMenus(params);
        this.menus[params.name].allows.forEach(child => {
            this.menus[child].render();
        });
        this.menus[params.name].render();
    }

    hideMenu(name = this.currentMenu){
        if(!name) return;
        this.container.style.display = "none";
        if(name === "AltarMenu"){
            this.menus["StakesMenu"].element.querySelector(".list-menu-ul").querySelectorAll(".menu-item").forEach(item => {
                    this.items[item.id].attachTo(this.menus["GemsMenu"]);
            });
        }
        this.currentMenu = null;
        this.menus[name].hide();
        this.menus[name].allows.forEach(child => {
            this.menus[child].hide();
        });
        this.blockInputCallback.activate();
    }

    #arrangeMenus(params){
        // arrange the menus in the container
        const icons = [];
        switch (params.name){
            case "AltarMenu":
                this.#moveMenu("StakesMenu", "AltarMenu", "afterbegin");
                this.#moveMenu("GemsMenu", "AltarMenu", "afterbegin");
                this.#moveMenu("HotbarMenu", "AltarMenu", "afterbegin");
                this.#moveMenu("SpellsMenu", "AltarMenu", "afterbegin");
                break;
            case "TowerMenu":
                //TODO: show applied stats hide the others + change values based on the received params
                this.#moveMenu("StatsMenu", "TowerMenu", "afterbegin");
                // show correct Gems based on received params
                for(let i = 0; i < params.items.length; i++){
                    icons.push(this.createSlotIcon({
                        id: `slot-icon-${this.items[params.items[i]].slot}`,
                        itemId: params.items[i],
                        src: this.items[params.items[i]].icon.src
                    }));
                }
                this.menus["GemInsertMenu"].addSlotIcons(icons);
                this.#moveMenu("GemInsertMenu", "TowerMenu", "afterbegin");
                this.#moveMenu("GemsMenu", "TowerMenu", "afterbegin");
                break;
            case "MineMenu":
                //TODO: show applied stats hide the others + change values based on the received params
                this.#moveMenu("StatsMenu", "MineMenu", "afterbegin");
                this.#moveMenu("CollectMenu", "MineMenu", "afterbegin");
                // show correct Gems based on received params
                for(let i = 0; i < params.items.length; i++){
                    icons.push(this.createSlotIcon({
                        id: `slot-icon-${params.items[i].slot}`,
                        itemId: params.items[i].id,
                        src: params.items[i].icon.src
                    }));
                }
                this.menus["GemInsertMenu"].addSlotIcons(icons);
                this.#moveMenu("GemInsertMenu", "MineMenu", "afterbegin");
                this.#moveMenu("GemsMenu", "MineMenu", "afterbegin");
                break;
            case "FusionTableMenu":
                //this.#moveMenu("InputMenu", "FuseTableMenu", "afterbegin");
                break;
            case "BuildMenu":
                this.#moveMenu("DecorationsMenu", "BuildMenu", "afterbegin");
                this.#moveMenu("ResourceBuildingsMenu", "BuildMenu", "afterbegin");
                this.#moveMenu("CombatBuildingsMenu", "BuildMenu", "afterbegin");
                break;
        }
    }
}