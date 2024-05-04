import {
    AltarMenu,
    BaseMenu,
    BuildMenu, CollectMenu, CombatBuildingsMenu, DecorationsMenu, FusionTableMenu, GemInsertMenu, GemsMenu, FuseInputMenu,
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
import {API_URL, blueprintURI} from "../configs/EndpointConfigs.js";

// loading bar

//simulateLoading();

/**
 * MenuManager class
 */
export class MenuManager extends Subject{
    #ctorToDBNameList;

    /**
     * ctor for the MenuManager
     * @param {{container: HTMLDivElement, blockInputCallback: {block: function, activate: function}, matchMakeCallback: function}} params
     * @property {Object} items - {id: MenuItem} id is of the form "Item.type-Item.id"
     */
    constructor(params) {
        super();
        this.container = params.container;
        this.blockInputCallback = params.blockInputCallback;
        this.matchMakeCallback = params.matchMakeCallback;
        this.items = {};
        this.menus = {};

        this.menusEnabled = true;
        this.currentMenu = null;
        this.dragElement = null;
        this.isSlotItem = false;
        this.dropElement = null;
        this.slot = null;
        this.infoFromDatabase = {};
        this.#ctorToDBNameList = this.#createCtorToDBNameList();

        this.collectParams = {
            meter: null,
            current: 0,
            max: 0,
            rate: 0
        };
        this.collectInterval = null;

        this.inputCrystalParams = {
            meter: null,
            current: 0,
            max: 100
        };
        this.loadingprogress = 0;

        this.container.addEventListener("dragstart", this.drag.bind(this));
        this.container.addEventListener("dragend", this.dragend.bind(this));
        this.gemId = 0;
    }

    // TODO: remove this
    #createCtorToDBNameList(){
        return {
            Tower: "Tower",
            Tree: "Tree",
            Bush: "Bush",
            Mine: "Mine",
            FusionTable: "FusionTable",
            WarriorHut: "WarriorHut",
            Wall: "Wall"
        }
    }

    ctorToDBName(ctorName){
        return this.#ctorToDBNameList[ctorName];
    }

    /**
     * add callbacks to menu for interactive menus
     * @param menu
     */
    #addMenuCallbacks(menu){
        if(menu instanceof BaseMenu){
            menu.element.querySelector(".close-button").addEventListener("click", this.exitMenu.bind(this));
        }
        if(menu instanceof AltarMenu){
            menu.element.querySelector(".play-button").addEventListener("click", () => this.matchMakeCallback());
        }
        if(menu instanceof FusionTableMenu){
            menu.element.querySelector(".fuse-button").addEventListener("click", () => this.FusionClicked());
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
        if(menu instanceof FuseInputMenu){
            menu.element.querySelector(".add-button").addEventListener("click", this.dispatchAddEvent.bind(this));
            menu.element.querySelector(".remove-button").addEventListener("click", this.dispatchRemoveEvent.bind(this));
        }
    }

    // loading bar
    FusionClicked() {
      if(this.inputCrystalParams.current > 0 && this.loadingprogress === 0) {
          this.toggleAnimation(true);
          this.dispatchEvent(this.createFuseEvent());
          this.inputCrystalParams.current = 0;
          this.menus["FuseInputMenu"].element.querySelector(".crystal-meter").style.width = this.inputCrystalParams.current + "%";
          this.menus["FuseInputMenu"].element.querySelector(".crystal-meter-text").innerText = `${this.inputCrystalParams.current}/${this.inputCrystalParams.max}`;

          /*
          // loading bar + reset features to be removed
          const progressBar = document.querySelector('.loading-bar');

          const intervalId = setInterval(() => {
              this.loadingprogress += 1; // Increase bar progress
              progressBar.style.width = `${this.loadingprogress}%`;

              if (this.loadingprogress >= 100) {
                  clearInterval(intervalId);
                  // Loading complete -> add gem and reset bars
                  this.#createRandomGemItem();
                  this.loadingprogress = 0;
                  progressBar.style.width = `${this.loadingprogress}%`;
                  this.inputCrystalParams.current = 0;
                  this.menus["FuseInputMenu"].element.querySelector(".crystal-meter").style.width = this.inputCrystalParams.current + "%";
                  this.menus["FuseInputMenu"].element.querySelector(".crystal-meter-text").innerText = `${this.inputCrystalParams.current}/${this.inputCrystalParams.max}`;
                  this.toggleAnimation(false);
              }
          }, 100); // Total time to load bar
          */
      }
    }

    createFuseEvent() {
        return new CustomEvent("startFusion");
    }

    // Function to start or stop the fusing arrow animation based on condition
    toggleAnimation(condition) {
        if (condition) {
            this.menus["FuseInputMenu"].element.querySelector(".arrow").classList.add('move-right');
        } else {
            this.menus["FuseInputMenu"].element.querySelector(".arrow").classList.remove('move-right');
        }
    }

    /**
     * exit the current menu
     */
    exitMenu(){
        this.hideMenu(this.currentMenu);
    }

    /**
     * switch to a different page in the current menu (only if currentMenu is a PageMenu)
     * @param {{target: HTMLElement}} event
     */
    switchPage(event){
        this.menus[this.currentMenu].allows.forEach(child => {
            if(child === event.target.dataset.name){
                this.menus[child].render();
            } else {
                this.menus[child].hide();
            }
        });
    }

    /**
     * creates a custom addGem event
     * @return {CustomEvent<{id: number | null}>}
     */
    createAddGemEvent(){
        console.log("Adding gem to building: ", this.dragElement);
        return new CustomEvent("addGem", {
            detail: {
                id: this.dragElement,
                slot: this.slot
            }
        });
    }

    /**
     * creates a custom removeGem event
     * @return {CustomEvent<{id: number | null}>}
     */
    createRemoveGemEvent(){
        return new CustomEvent("removeGem", {
            detail: {
                id: this.dragElement
            }
        });
    }

    /**
     * creates a custom collect event
     * @return {CustomEvent<>}
     */
    createCollectEvent() {
        return new CustomEvent("collect");
    }

    /**
     * creates a custom add event
     * @return {CustomEvent<>}
     */
    createAddEvent() {
        return new CustomEvent("add");
    }

    /**
     * creates a custom remove event
     * @return {CustomEvent<>}
     */
    createRemoveEvent() {
        return new CustomEvent("remove");
    }

    /**
     * creates a custom build event
     * @param {number} buildingId
     * @return {CustomEvent<{id: number}>}
     */
    createBuildEvent(buildingId){
        return new CustomEvent("build", {
            detail: {
                id: buildingId
            }
        });
    }

    /**
     * dispatches a build event
     * @param {{target: HTMLElement}} event
     */
    dispatchBuildEvent(event){
        if(event.target.classList.contains("build-item")){
            this.dispatchEvent(this.createBuildEvent(event.target.id));
        }
    }

    /**
     * dispatches a collect event
     * @param event
     */
    dispatchCollectEvent(event){
        console.log("Collecting resources");
        this.menus["CollectMenu"].element.querySelector(".crystal-meter").style.width = "0%";
        this.collectParams.current = 0;
        this.menus["CollectMenu"].element.querySelector(".crystal-meter-text").innerText = `${this.collectParams.current}/${this.collectParams.max}`;
        this.dispatchEvent(this.createCollectEvent());
    }

    /**
     * dispatches a add event
     * @param event
     */
    dispatchAddEvent(event){
        if(this.inputCrystalParams.current+10 <= this.inputCrystalParams.max && this.loadingprogress === 0){
            console.log("Adding 10 crystals to fuse stakes");
            this.inputCrystalParams.current += 10;
            this.dispatchEvent(this.createRemoveEvent());
        }
        this.menus["FuseInputMenu"].element.querySelector(".crystal-meter").style.width = this.inputCrystalParams.current + "%";
        this.menus["FuseInputMenu"].element.querySelector(".crystal-meter-text").innerText = `${this.inputCrystalParams.current}/${this.inputCrystalParams.max}`;
    }

    /**
     * dispatches a remove event
     * @param event
     */
    dispatchRemoveEvent(event){
        if(this.inputCrystalParams.current-10 >= 0 && this.loadingprogress === 0){
            console.log("Removing 10 crystals of fuse stakes");
            this.inputCrystalParams.current -= 10;
            this.dispatchEvent(this.createAddEvent());
        }
        this.menus["FuseInputMenu"].element.querySelector(".crystal-meter").style.width = this.inputCrystalParams.current + "%";
        this.menus["FuseInputMenu"].element.querySelector(".crystal-meter-text").innerText = `${this.inputCrystalParams.current}/${this.inputCrystalParams.max}`;
    }

    /**
     * drag event handler
     * @param event
     */
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

    /**
     * dragend event handler
     * @param event
     */
    dragend(event){
        if(!this.dragElement) return;
        if (!this.isSlotItem && !this.items[this.dragElement]?.equipped) {
            this.items[this.dragElement].element.style.opacity = 1;
        }
        this.dragElement = null;
        this.dropElement = null;
    }

    /**
     * get the parent menu of an element by class or null if container is reached and class is not found
     * @param {HTMLElement} element
     * @param {string} className
     * @return {HTMLElement | null}
     */
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
    /**
     * dragover event handler
     * @param event
     */
    dragover(event){
        if(!this.dragElement) return;
        this.dropElement = this.getParentMenuByClass(event.target, "list-menu").id;
        if(!(this.dropElement)) return;
        if(this.menus[this.dropElement].allows.includes(this.items[this.dragElement].type)) {
            event.preventDefault();
        }
    }

    /**
     * drop event handler
     * @param event
     */
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

    /**
     * dragover event handler for slot menu
     * @param event
     */
    dragoverSlot(event){
        if(!this.dragElement) return;
        this.dropElement = this.getParentMenuByClass(event.target, "slot-menu").id;
        if(this.items[this.dragElement]?.equipped) return;
        if(this.menus[this.dropElement].allows.includes(this.items[this.dragElement].type) && event.target.classList.contains("slot")){
            event.preventDefault();
            this.slot = event.target.id.substring(event.target.id.lastIndexOf("-")+1);
        }
    }

    /**
     * create a slot icon image HTMLElement
     * @param {{itemId: number, src: string, id: number}} params
     * @return {HTMLImageElement}
     */
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
    /**
     * drop event handler for slot menu
     * @param event
     */
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

    /**
     * add multiple items to the menuManager
     * @param {Object[]} items
     */
    addItems(items){
        for(const item of items){
            this.addItem(item);
        }
    }

    /**
     * add a single item to the menuManager
     * @param {{item: Item, icon: {src: string, width: number, height: number}, description: string, extra: Object}} params
     */
    addItem(params){
        const menuItem = this.#createMenuItem({
            id: params.item.getItemId(),
            name: params.item.getDisplayName(),
            belongsIn: params.item.belongsIn,
            icon: params.icon,
            description: params.description,
            extra: params.extra
        });
        if(menuItem instanceof BuildingItem){
            menuItem.element.addEventListener("click", () => this.dispatchEvent(this.createBuildEvent(menuItem.id)));
        }

        this.#addItemToMenu(menuItem);
        this.items[params.item.getItemId()] = menuItem;
    }

    /**
     * add a menuItem to the menu
     * @param {MenuItem} item
     */
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

    //untested - should not be necessary
    moveItem(itemId, fromMenu, toMenu){
        this.items.forEach(i => {
            if(i.id === itemId){
                i.attachTo(toMenu);
            }
        });
    }

    /**
     * move a subMenu from one menu to another
     * @param {ListMenu | SlotMenu | CollectMenu} child
     * @param {BaseMenu | PageMenu} parent
     * @param {"afterbegin" | "beforeend"} position
     * @return {boolean}
     */
    #moveMenu(child, parent, position){
        if(position !== "afterbegin" && position !== "beforeend") return false;
        this.menus[parent].addChild(position, this.menus[child]);
    }

    /**
     * create a menuItem based on the item
     * @param item
     * @return {StatItem|DecorationBuildingItem|null|ResourceBuildingItem|SpellItem|GemItem|CombatBuildingItem}
     */
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

    /**
     * create stat menu items
     */
    #createStatMenuItems(params){
        //const stats = [];
        //for(const stat in stats){
        //    this.items[stat.id] = new StatItem(stat);
        //}
        console.log(params);
        let boosts = [];
        let names = [];
        let buildingStats = [];
        if (params.name === "FusionTableMenu"){
            boosts = ["gemBonus", "fuseSpeed"];
            names = ["Gem chance: ", "Fusion speed: "];
            buildingStats = [params.stats["gemBonus"], params.stats["fuseSpeed"]];
        }
        else if (params.name === "TowerMenu"){
            boosts = ["hp", "damage", "attackSpeed"];
            names = ["HP: ", "Damage: ", "Attack speed: "];
            buildingStats = [params.stats["hp"], params.stats["damage"], params.stats["attackSpeed"]];
        }
        else if (params.name === "MineMenu"){
            boosts = ["mineSpeed", "capacity", "gemBonus"];
            names = ["Mining speed: ", "Capacity: ", "Gem chance: "];
            buildingStats = [params.stats["mineSpeed"], params.stats["capacity"], params.stats["gemBonus"]];
        }
        console.log(buildingStats);
        let items = [];
        for (let i = 0; i < boosts.length; i++){
            items.push({
                item: {name: boosts[i], id: i, belongsIn: "StatsMenu", getItemId: () => boosts[i], getDisplayName: () => names[i] + buildingStats[i]},
                icon: {src: '/static/assets/images/menu/' + boosts[i] + '.png', width: 50, height: 50},
                description: ""
            });
        }
        //todo fix deleting stat items
        //this.removeStatsMenuItems();
        this.addItems(items);
    }

    removeStatsMenuItems(){
        let ids = ["gemBonus", "fuseSpeed", "hp", "damage", "attackSpeed", "mineSpeed", "capacity"];
        for (let i = 0; i < ids.length; i++){
            this.removeItem(ids[i]);
        }
    }

    /**
     * create building menu items
     */
    #createBuildingItems(){
        // TODO: remove and refactor code below
        const towerName = "Tower";
        const treeName = "Tree";
        const bushName = "Bush";
        const mineName = "Mine";
        const fusionTableName = "FusionTable";
        const warriorHutName = "WarriorHut";
        const wallName = "Wall";

        const items = [
            {
                item: {name: "tower", id: 0, belongsIn: "CombatBuildingsMenu", getItemId: () => "Tower", getDisplayName: () => "Tower"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === towerName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === towerName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === towerName)?.buildTime}
            },
            {
                item: {name: "wall", id: 0, belongsIn: "CombatBuildingsMenu", getItemId: () => "Wall", getDisplayName: () => "Wall"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === wallName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === wallName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === wallName)?.buildTime}
            },
            {
                item: {name: "tree", id: 1, belongsIn: "DecorationsMenu", getItemId: () => "Tree", getDisplayName: () => "Tree"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === treeName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === treeName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === treeName)?.buildTime}
            },
            {
                item: {name: "bush", id: 2, belongsIn: "DecorationsMenu", getItemId: () => "Bush", getDisplayName: () => "Bush"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === bushName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === bushName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === bushName)?.buildTime}
            },
            {
                item: {name: "mine", id: 3, belongsIn: "ResourceBuildingsMenu", getItemId: () => "Mine", getDisplayName: () => "Mine"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === mineName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === mineName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === mineName)?.buildTime}
            },
            {
                item: {name: "fusion table", id: 4, belongsIn: "ResourceBuildingsMenu", getItemId: () => "FusionTable", getDisplayName: () => "Fusion table"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === fusionTableName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === fusionTableName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === fusionTableName)?.buildTime}
            },
            {
                item: {name: "warrior hut", id: 5, belongsIn: "CombatBuildingsMenu", getItemId: () => "WarriorHut", getDisplayName: () => "Warrior hut"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === warriorHutName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === warriorHutName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === warriorHutName)?.buildTime}
            }
        ];

        this.addItems(items);
    }

    #createSpellItems(){
        let spells = ["fireSpell", "freezeSpell", "shieldSpell", "healSpell", "thunderSpell"];
        let names = ["Fire", "Freeze", "Shield", "Heal", "Thunder"];
        let items = [];
        for (let i = 0; i < spells.length; i++){
            items.push({
                item: {name: spells[i], id: i, belongsIn: "SpellsMenu", getItemId: () => spells[i], getDisplayName: () => names[i]},
                icon: {src: '/static/assets/images/spells/' + spells[i] + '.png', width: 50, height: 50},
                description: ""
            });
        }
        this.addItems(items);
    }

    #createHotbarItem(){
        let buildSpell = {
            //TODO: SpellsMenu should be HotbarMenu but that gives an error
            item: {name: "buildSpell", id: 0, belongsIn: "SpellsMenu", getItemId: () => "buildSpell", getDisplayName: () => " Build"},
            icon: {src: '/static/assets/images/spells/buildSpell.png', width: 50, height: 50},
            description: ""
        };
        this.addItem(buildSpell);
    }

    /**
     * create a menu
     * @param {string} ctor - corresponds to the name of a ctor which is a subclass of IMenu
     * @return {boolean}
     */
    #createMenu(ctor){
        const menu = new ctor({parent: this});
        if(this.menus[menu.name]) return false;

        this.#addMenuCallbacks(menu);

        this.menus[menu.name] = menu;
        this.container.appendChild(this.menus[menu.name].element);
        return true;
    }

    /**
     * create menus, calls createMenu for each ctor in ctorList
     * @param {string[]} ctorList
     */
    #createMenus(ctorList){
        ctorList.forEach(ctor => this.#createMenu(ctor));
    }

    //TODO: refactor this? maybe make create MenuItems less hard coded/more dynamic
    /**
     * create menus and menu items
     */
    createMenus(){
        this.#createMenus([SpellsMenu, HotbarMenu, GemsMenu, StakesMenu, AltarMenu, GemInsertMenu, StatsMenu, TowerMenu, MineMenu, FusionTableMenu, CombatBuildingsMenu, ResourceBuildingsMenu, DecorationsMenu, BuildMenu, CollectMenu, FuseInputMenu]);
        this.collectParams.meter = this.menus["CollectMenu"].element.querySelector(".crystal-meter");
        this.#createBuildingItems();
        this.#createSpellItems();
        this.#createHotbarItem();
    }

    /**
     * render a menu and call the blockInputCallback.block function
     * @param {{name: string}} params
     */
    renderMenu(params){
        console.log(params);
        console.log("params");
        if(!params.name || !this.menusEnabled) return;
        if(this.currentMenu) this.hideMenu(this.currentMenu);
        this.blockInputCallback.block();
        this.container.style.display = "block";
        this.currentMenu = params.name;
        this.#arrangeMenus(params);
        this.menus[params.name].allows.forEach(child => {
            this.menus[child].render();
        });
        this.menus[params.name].render();
        this.#createStatMenuItems(params);
    }

    /**
     * hide the current menu and call the blockInputCallback.activate function
     * @param {string} name
     */
    hideMenu(name = this.currentMenu){
        if(!name || !this.menusEnabled) return;
        this.container.style.display = "none";
        if(name === "AltarMenu"){
            this.menus["StakesMenu"].element.querySelector(".list-menu-ul").querySelectorAll(".menu-item").forEach(item => {
                    this.items[item.id].attachTo(this.menus["GemsMenu"]);
            });
        }
        if(name === "MineMenu"){
            clearInterval(this.collectInterval);
            this.collectInterval = null;
        }
        this.currentMenu = null;
        this.menus[name].hide();
        this.menus[name].allows.forEach(child => {
            this.menus[child].hide();
        });
        this.blockInputCallback.activate();
    }

    /**
     * update the amount of crystals that appear in the CollectMenu
     */
    updateCrystals(){
        this.collectParams.current = this.collectParams.current + this.collectParams.rate > this.collectParams.max ? this.collectParams.max : this.collectParams.current + this.collectParams.rate;
        this.collectParams.meter.style.width = `${(this.collectParams.current/this.collectParams.max)*100}%`;
        this.menus["CollectMenu"].element.querySelector(".crystal-meter-text").innerText = `${this.collectParams.current}/${this.collectParams.max}`;
    }

    /**
     * creates slot icons for the GemInsertMenu (basically just takes the icon of the gem and puts it in a slot)
     * @param items
     * @return {*}
     */
    createSlotIcons(items){
        return items.map(item => this.createSlotIcon({
            id: `slot-icon-${item.slot}`,
            itemId: item.id,
            src: item.icon.src
        }));
    }

    /**
     * maps ids to menu items, always succeeds even if some ids are not found
     * so it is possible to have undefined values in the returned array
     * @param {string[]} ids
     * @return {MenuItem[]}
     */
    #getMenuItemsById(ids){
        return ids.map(id => this.items[id]);
    }

    /**
     * arrange menus in preparation for rendering
     * @param {{name: "AltarMenu" | "BuildMenu"} | {name: "TowerMenu" | "FusionTableMenu", gemIds: String[]} | {name: "MineMenu", gemIds: String[], crystals: number, maxCrystals: number, rate: number}} params
     */
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
                this.menus["GemInsertMenu"].addSlotIcons(this.createSlotIcons(this.#getMenuItemsById(params.gemIds)));
                this.#moveMenu("GemInsertMenu", "TowerMenu", "afterbegin");
                this.#moveMenu("GemsMenu", "TowerMenu", "afterbegin");
                break;
            case "MineMenu":
                //TODO: show applied stats hide the others + change values based on the received params
                this.#moveMenu("StatsMenu", "MineMenu", "afterbegin");
                this.#moveMenu("CollectMenu", "MineMenu", "afterbegin");
                this.menus["CollectMenu"].element.querySelector(".crystal-meter").style.width = `${(params.crystals/params.maxCrystals)*100}%`; //TODO: change this so text stays in the middle of the meter
                this.menus["CollectMenu"].element.querySelector(".crystal-meter-text").innerText = `${params.crystals}/${params.maxCrystals}`;

                this.collectParams.current = params.crystals;
                this.collectParams.max = params.maxCrystals;
                this.collectParams.rate = params.rate;
                this.collectInterval = setInterval(this.updateCrystals.bind(this), 1000);

                // show correct Gems based on received params
                this.menus["GemInsertMenu"].addSlotIcons(this.createSlotIcons(this.#getMenuItemsById(params.gemIds)));
                this.#moveMenu("GemInsertMenu", "MineMenu", "afterbegin");
                this.#moveMenu("GemsMenu", "MineMenu", "afterbegin");
                break;
            case "FusionTableMenu":
                this.#moveMenu("StatsMenu", "FusionTableMenu", "afterbegin");
                // show correct Gems based on received params
                this.menus["GemInsertMenu"].addSlotIcons(this.createSlotIcons(this.#getMenuItemsById(params.gemIds)));
                this.#moveMenu("GemInsertMenu", "FusionTableMenu", "afterbegin");
                this.#moveMenu("GemsMenu", "FusionTableMenu", "afterbegin");
                this.#moveMenu("FuseInputMenu", "FusionTableMenu", "afterbegin");
                break;
            case "BuildMenu":
                this.#moveMenu("DecorationsMenu", "BuildMenu", "afterbegin");
                this.#moveMenu("ResourceBuildingsMenu", "BuildMenu", "afterbegin");
                this.#moveMenu("CombatBuildingsMenu", "BuildMenu", "afterbegin");
                break;
        }
    }

    /**
     * fetch info from the database
     * @return {Promise<void>}
     */
    async fetchInfoFromDatabase(){
        // Get info for build menu
        try {
            this.infoFromDatabase["buildings"] = [];
            // GET request to server
            const response = await $.getJSON(`${API_URL}/${blueprintURI}/list`);
            for(const blueprint of response){
                // Extract info from response
                this.infoFromDatabase["buildings"].push({
                    id: blueprint.id,
                    name: blueprint.name,
                    description: blueprint.description,
                    cost: blueprint.cost,
                    buildTime: blueprint.buildtime
                });
            }
        } catch (e){
            console.error("Error in MenuManager: ", e);
        }
    }
}