import {
    AltarMenu,
    BaseMenu,
    BuildMenu,
    CollectMenu,
    CombatBuildingsMenu,
    DecorationsMenu,
    FusionTableMenu,
    GemInsertMenu,
    GemsMenu,
    FuseInputMenu,
    HotbarMenu,
    ListMenu,
    MineMenu,
    PageMenu,
    ResourceBuildingsMenu,
    SlotMenu,
    SpellsMenu,
    StakesMenu,
    StatsMenu,
    TowerMenu,
    BuildingMenu,
    MultiplayerMenu,
    MultiplayerStatsMenu,
    MultiplayerGemsMenu,
    PropMenu
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
import {spellTypes} from "../Model/Spell.js";

// loading bar

//simulateLoading();

/**
 * MenuManager class
 */
export class MenuManager extends Subject{
    #ctorToDBNameList;

    /**
     * ctor for the MenuManager
     * @param {{container: HTMLDivElement, blockInputCallback: {block: function, activate: function},
     * matchMakeCallback: function, checkStakesCallback: function | null,
     * closedMultiplayerMenuCallback: function,
     * playerInfo: PlayerInfo}} params - TODO: possibly remove playerInfo as param
     * @property {Object} items - {id: MenuItem} id is of the form "Item.type-Item.id"
     */
    constructor(params) {
        super();
        this.container = params.container;
        this.blockInputCallback = params.blockInputCallback;
        this.matchMakeCallback = params.matchMakeCallback;
        this.checkStakesCallback = params?.checkStakesCallback ?? null;
        this.closedMultiplayerMenuCallback = params?.closedMultiplayerMenuCallback;
        this.items = new Map();
        this.menus = new Map();

        // TODO: why playerInfo here?
        this.playerInfo = params.playerInfo;

        this.menusEnabled = true;
        this.matchmaking = false;
        this.currentMenu = null;
        this.dragElement = null;
        this.isSlotItem = false;
        this.dropElement = null;
        this.slot = null;
        this.infoFromDatabase = {};
        this.#ctorToDBNameList = this.#createCtorToDBNameList();
        this.playerCrystals = 0;

        this.collectParams = {
            meter: null,
            current: 0,
            max: 0,
            rate: 0
        };
        this.collectInterval = null;
        this.fortune = 0;

        this.inputCrystalParams = {
            meter: null,
            current: 0,
            max: 100
        };
        this.loadingprogress = 0;

        this.container.addEventListener("dragstart", this.drag.bind(this));
        this.container.addEventListener("dragend", this.dragend.bind(this));
    }


    /**
     * method for adding callbacks to the menuManager in case they could not be added in the constructor/ they need to be changed
     * @param {{blockInputCallback: {block: function, activate: function} | null,
     * matchMakeCallback: function | null, checkStakesCallback: function | null}} callbacks
     */
    addCallbacks(callbacks){
        if(callbacks.blockInputCallback) this.blockInputCallback = callbacks.blockInputCallback;
        if(callbacks.matchMakeCallback) this.matchMakeCallback = callbacks.matchMakeCallback;
        if(callbacks.checkStakesCallback) this.checkStakesCallback = callbacks.checkStakesCallback;
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
        if (menu instanceof PropMenu) {
            menu.element.querySelector(".delete-button").addEventListener("click", this.dispatchDeleteEvent.bind(this));
        }
        if(menu instanceof BuildingMenu){
            menu.element.querySelector(".lvl-up-button").addEventListener("click", this.dispatchLvlUpEvent.bind(this));
        }
        if(menu instanceof AltarMenu){
            menu.element.querySelector(".play-button").addEventListener("click", (event) => {
                this.matchMakeCallback();
            });
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
        if(menu instanceof StakesMenu){
            menu.element.addEventListener("drop", (event) => {
                this.checkStakes();
            });
        }
        if(menu instanceof GemsMenu){
             menu.element.addEventListener("drop", (event) => {
                this.checkStakes();
            });
        }
        if(menu instanceof MultiplayerMenu){
            menu.element.querySelector(".close-button").addEventListener("click", this.closedMultiplayerMenuCallback);
        }
    }

    /**
     * creates a confetti div with random size and falling animation
     * @param {number} id
     * @return {HTMLDivElement}
     */
    createConfetti(id) {
        const colours = ["#ffbf00", "#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#00ffff"];

        let confetti = document.createElement("div");
        const w = Math.random() * 8;
        const l = Math.random() * 100;
        confetti.classList.add("confetti");
        confetti.style.width = `${w}px`;
        confetti.style.height = `${w*0.4}px`;
        confetti.style.backgroundColor = colours[Math.floor(Math.random()*colours.length)];
        confetti.style.top = "-20%";
        confetti.style.left = `${l}%`;
        confetti.style.opacity = `${Math.max((Math.random() + 0.5), 1)}`;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.animate([
            {
                top: "-20%",
                left: `${l}%`
            },
            {
                top: "110%",
                left: `${Math.random() * 15 + l}%`
            }

        ],
            {
                duration: Math.random()*2000+2000,
                iterations: Infinity
            });
        confetti.id = `confetti-${id}`;
        return confetti;
    }

    /**
     * generate confetti on the screen
     * @param {number} amount - amount of confetti to generate
     */
    startConfetti(amount) {
        for(let i = 0; i < amount; i++) {
            this.container.appendChild(this.createConfetti(i));
        }
    }

    /**
     * remove all confetti from the screen
     */
    stopConfetti() {
        this.container.querySelectorAll(".confetti").forEach(confetti => {
            confetti.remove();
        });
    }

    checkStakes(){
        const gemsIds = [];
        this.menus.get("GemsMenu").element.querySelector(".list-menu-ul").querySelectorAll(".menu-item").forEach(item => gemsIds.push(item.id));
        if(this.checkStakesCallback(gemsIds)){
            this.container.querySelector(".play-button-container").classList.remove("inactive");
            this.container.querySelector(".play-button-container").classList.add("active");
        }else {
            this.container.querySelector(".play-button-container").classList.remove("active");
            this.container.querySelector(".play-button-container").classList.add("inactive");
        }
    }

    /**
     * toggle the matchmaking button and if gems are allowed to be dragged and dropped
     * @param {{detail: {matchmaking: boolean}}} event
     */
    toggleMatchMaking(event){
        this.matchmaking = event.detail.matchmaking;
        const element = this.menus.get("AltarMenu").element.querySelector(".play-button-container");
        if(this.matchmaking){
            element.classList.add("pressed");
        } else {
            element.classList.remove("pressed");
        }
    }

    // loading bar
    FusionClicked() {
      if(this.inputCrystalParams.current > 0 && this.loadingprogress === 0) {
          this.toggleAnimation(true);
          this.dispatchEvent(this.createFuseEvent());
          /* TODO: don't change xp here do this when fusion task is done
          this.playerInfo.changeXP(2*this.inputCrystalParams.current);
          */
          this.inputCrystalParams.current = 0;
          this.menus.get("FuseInputMenu").element.querySelector(".crystal-meter").style.width = this.inputCrystalParams.current + "%";
          this.menus.get("FuseInputMenu").element.querySelector(".crystal-meter-text").innerText = `${this.inputCrystalParams.current}/${this.inputCrystalParams.max}`;


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

    createMineGemEvent() {
        return new CustomEvent("mineGem");
    }

    // Function to start or stop the fusing arrow animation based on condition
    toggleAnimation(condition) {
        if (condition) {
            this.menus.get("FuseInputMenu").element.querySelector(".arrow").classList.add('move-right');
        } else {
            this.menus.get("FuseInputMenu").element.querySelector(".arrow").classList.remove('move-right');
        }
    }

    /**
     * exit the current menu
     */
    exitMenu(){
        this.#hideMenu(this.currentMenu);
    }

    /**
     * switch to a different page in the current menu (only if currentMenu is a PageMenu)
     * @param {{target: HTMLElement}} event
     */
    switchPage(event){
        this.menus.get(this.currentMenu).allows.forEach(child => {
            if(child === event.target.dataset.name){
                this.menus.get(child).render();
            } else {
                this.menus.get(child).hide();
            }
        });
    }

    /**
     * creates a custom addGem event
     * @return {CustomEvent<{id: number | null}>}
     */
    createAddGemEvent(){
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
     * creates a custom switch spell event
     * @param {number} spellId - the id of the last spell that was equipped
     * @param {boolean} equip - whether the spell should be equipped or unequipped
     * @return {CustomEvent<>} returns an array of the ids of the spells to equip
     */
    createSwitchSpellEvent(spellId, equip=true){
        return new CustomEvent("switchSpells", {
            detail: {
                spellIds: this.menus.get("HotbarMenu").getEquippedSpellIds(spellId, equip)
            }
        });

    }

    /**
     * creates a custom lvl up event
     */
    dispatchLvlUpEvent(){
        this.dispatchEvent(new CustomEvent("lvlUp"));
    }

    /**
     * dispatches a delete event
     */
    dispatchDeleteEvent(){
        this.dispatchEvent(new CustomEvent("delete"));
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
        this.menus.get("CollectMenu").element.querySelector(".crystal-meter").style.width = "0%";
        this.collectParams.current = 0;
        this.menus.get("CollectMenu").element.querySelector(".crystal-meter-text").innerText = `${this.collectParams.current}/${this.collectParams.max}`;
        this.dispatchEvent(this.createCollectEvent());
    }

    /**
     * dispatches a add event
     * @param event
     */
    dispatchAddEvent(event){
        console.log(this.playerCrystals);
        if (this.playerCrystals >= 10 ) {
            if (this.inputCrystalParams.current + 10 <= this.inputCrystalParams.max && this.loadingprogress === 0) {
                this.inputCrystalParams.current += 10;
                this.playerCrystals -= 10;
                this.dispatchEvent(this.createRemoveEvent());
            }
            this.menus.get("FuseInputMenu").element.querySelector(".crystal-meter").style.width = this.inputCrystalParams.current + "%";
            this.menus.get("FuseInputMenu").element.querySelector(".crystal-meter-text").innerText = `${this.inputCrystalParams.current}/${this.inputCrystalParams.max}`;
        }
    }

    /**
     * dispatches a remove event
     * @param event
     */
    dispatchRemoveEvent(event){
        if(this.inputCrystalParams.current-10 >= 0 && this.loadingprogress === 0){
            this.inputCrystalParams.current -= 10;
            this.playerCrystals += 10;
            this.dispatchEvent(this.createAddEvent());
        }
        this.menus.get("FuseInputMenu").element.querySelector(".crystal-meter").style.width = this.inputCrystalParams.current + "%";
        this.menus.get("FuseInputMenu").element.querySelector(".crystal-meter-text").innerText = `${this.inputCrystalParams.current}/${this.inputCrystalParams.max}`;
    }

    /**
     * drag event handler
     * @param event
     */
    drag(event){
        if(this.matchmaking) return;
        let id = event.target.id;
        this.isSlotItem = event.target.classList.contains("slot-item")
        if(this.isSlotItem) {
            this.slot = event.target.id.substring(event.target.id.lastIndexOf("-")+1);
            id  = event.target.dataset.itemId;
        }

        event.dataTransfer.clearData();
        event.dataTransfer.setDragImage(this.items.get(id).icon, 0, 0);

        if(!this.isSlotItem && this.items.get(id)?.equipped) return;
        this.items.get(id).element.style.opacity = 0.5;
        this.dragElement = id;
    }

    /**
     * dragend event handler
     * @param event
     */
    dragend(event){
        if(!this.dragElement) return;
        if (!this.isSlotItem && !this.items.get(this.dragElement)?.equipped) {
            this.items.get(this.dragElement).element.style.opacity = 1;
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
        if(this.menus.get(this.dropElement).allows.includes(this.items.get(this.dragElement).type)) {
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
            this.menus.get("GemInsertMenu").element.querySelector(`#slot-${this.slot}`).innerHTML = "";
            this.items.get(this.dragElement).equipped = false;
            this.items.get(this.dragElement).slot = null;
            this.items.get(this.dragElement).element.style.opacity = 1;
            this.slot = null;
        }
        if(this.dropElement === "HotbarMenu" || this.dropElement === "SpellsMenu"){
            this.dispatchEvent(this.createSwitchSpellEvent(this.dragElement, this.dropElement === "HotbarMenu"));
        }
        this.items.get(this.dragElement).attachTo(this.menus.get(this.dropElement));
    }

    /**
     * dragover event handler for slot menu
     * @param event
     */
    dragoverSlot(event){
        if(!this.dragElement) return;
        this.dropElement = this.getParentMenuByClass(event.target, "slot-menu").id;
        if(this.items.get(this.dragElement)?.equipped) return;
        if(this.menus.get(this.dropElement).allows.includes(this.items.get(this.dragElement).type) && event.target.classList.contains("slot")){
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
        this.menus.get(this.dropElement).addIcon(this.slot, this.createSlotIcon({
            id: `slot-icon-${this.slot}`,
            itemId: this.items.get(this.dragElement).id,
            src: this.items.get(this.dragElement).icon.src
        }));
        this.items.get(this.dragElement).element.style.opacity = 0.5;
        this.items.get(this.dragElement).equipped = true;
        this.items.get(this.dragElement).slot = this.slot;
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
        this.items.set(params.item.getItemId(), menuItem);
    }

    /**
     * add a menuItem to the menu
     * @param {MenuItem} item
     */
    #addItemToMenu(item){
        item.attachTo(this.menus.get(item.belongsIn));
        // this.menus.get(item.belongsIn).addChild("afterbegin", item);
    }

    //untested
    removeItem(itemId){
        const item = this.items.get(itemId);
        if(item){
            item.detach();
            this.items.delete(itemId);
        } else {
            console.error("Cannot remove MenuItem; not found");
        }
    }

    //untested - should not be necessary
    moveItem(itemId, toMenu){
        const item = this.items.get(itemId);
        if(item){
            item.attachTo(this.menus.get(toMenu));
        } else {
            console.error("Cannot move MenuItem; not found");
        }
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
        this.menus.get(parent).addChild(position, this.menus.get(child));
    }

    /**
     * create a menuItem based on the item
     * @param item
     * @return {StatItem|DecorationBuildingItem|null|ResourceBuildingItem|SpellItem|GemItem|CombatBuildingItem}
     */
    #createMenuItem(item){
        if(item.belongsIn === "SpellsMenu" || item.belongsIn === "HotbarMenu"){
            return new SpellItem(item);
        } else if (item.belongsIn === "GemsMenu" || item.belongsIn === "StakesMenu"){
            item.equipped = item.extra?.equipped ?? false;
            item.slot = item.extra?.slot ?? null;
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
    #createStatMenuItems(){
        //TODO: remove and make dynamic
        const stats = ["fortune", "speed", "damage", "capacity"];
        const descriptions = [
            "increases probability of positive events",
            "shows how fast the building can produce items",
            "mesures the pain the building can inflict",
            "shows the amount of items the building can contain"
        ];
        let items = [];
        for (let i = 0; i < stats.length; i++){
            items.push({
                item: {belongsIn: "StatsMenu", getItemId: () => stats[i], getDisplayName: () => stats[i]},
                icon: {src: '/static/assets/images/menu/' + stats[i] + '.png', width: 50, height: 50},
                description: descriptions[i]
            });
        }
        this.addItems(items);
    }

    /**
     * arrange stat menu items
     * @param {{name: string, stats: Map}} params
     */
    #arrangeStatMenuItems(params){
        //TODO: remove and make dynamic
        const stats = ["fortune", "speed", "damage", "capacity"];
        // update stats for according to the building
        if (params.name === "MineMenu"){
            params.stats.set("capacity", params.maxCrystals);
        }
        if (params.name === "TowerMenu"){
            params.stats.set("capacity", params.stats.get("capacity")*100);
            params.stats.set("damage", params.stats.get("damage")*5);
        }
        for(const stat of stats){
            if(params.stats.has(stat)){
                this.items.get(stat).element.style.display = this.items.get(stat).display;
                //TODO: change the text based on the type of building
                let name = `${stat}: ${Math.round(params.stats.get(stat))}`;
                let text = `placeholder description`;
                if (params.name === "MineMenu") {
                    if (stat === "capacity") {
                        text = "Max stored crystals";
                    }
                    else if (stat === "speed") {
                        text = "Mine speed";
                    }
                    else if (stat === "fortune") {
                        text = "Chance of mining gem";
                    }
                }
                else if (params.name === "TowerMenu") {
                    if (stat === "capacity") {
                        text = "Hitpoints";
                    }
                    else if (stat === "damage") {
                        text = "Attack damage";
                    }
                    else if (stat === "speed") {
                        text = "Attack speed";
                    }
                    else if (stat === "fortune") {
                        text = "Critical hit chance";
                    }
                }
                else if (params.name === "FusionTableMenu") {
                    if (stat === "capacity") {
                        text = "Max crystals to fuse";
                    }
                    else if (stat === "speed") {
                        text = "Fusion speed";
                    }
                    else if (stat === "fortune") {
                        text = "Power of generated gem";
                    }
                }
                this.items.get(stat).element.querySelector(".menu-item-description-name").innerText = name;
                this.items.get(stat).element.querySelector(".menu-item-description-text").innerText = text;
            } else {
                this.items.get(stat).element.style.display = "none";
            }
        }
    }

    /**
     * updates the buildings placed and total buildings placed in the buildingItems based on the params
     * @param {{building: string, placed: number, total: number}[]} params
     */
    #updateBuildingItems(params){
        console.log("inside updateBuildingItems:", params);
        for(const param of params){
            if(param.total === 0){ //TODO: don't do it like this: use locked css class and apply it on the menuItem if applicable
                this.items.get(param.building).element.style.opacity = 0.5;
            }else{
                this.items.get(param.building).element.style.opacity = 1;
                this.items.get(param.building).element.querySelector(".menu-item-description-placed").innerText = `placed: ${param.placed}/${param.total}`;
            }
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
                item: {belongsIn: "CombatBuildingsMenu", getItemId: () => "Tower", getDisplayName: () => "Tower"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === towerName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === towerName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === towerName)?.buildTime}
            },
            {
                item: {belongsIn: "CombatBuildingsMenu", getItemId: () => "Wall", getDisplayName: () => "Wall"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === wallName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === wallName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === wallName)?.buildTime}
            },
            {
                item: {belongsIn: "DecorationsMenu", getItemId: () => "Tree", getDisplayName: () => "Tree"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === treeName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === treeName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === treeName)?.buildTime}
            },
            {
                item: {belongsIn: "DecorationsMenu", getItemId: () => "Bush", getDisplayName: () => "Bush"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === bushName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === bushName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === bushName)?.buildTime}
            },
            {
                item: {belongsIn: "ResourceBuildingsMenu", getItemId: () => "Mine", getDisplayName: () => "Mine"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === mineName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === mineName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === mineName)?.buildTime}
            },
            {
                item: {belongsIn: "ResourceBuildingsMenu", getItemId: () => "FusionTable", getDisplayName: () => "Fusion table"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === fusionTableName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === fusionTableName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === fusionTableName)?.buildTime}
            },
            {
                item: {belongsIn: "CombatBuildingsMenu", getItemId: () => "WarriorHut", getDisplayName: () => "Warrior hut"},
                icon: {src: "https://via.placeholder.com/50", width: 50, height: 50},
                description: this.infoFromDatabase["buildings"].find(building => building.name === warriorHutName)?.description,
                extra: {cost: this.infoFromDatabase["buildings"].find(building => building.name === warriorHutName)?.cost, buildTime: this.infoFromDatabase["buildings"].find(building => building.name === warriorHutName)?.buildTime}
            }
        ];

        this.addItems(items);
    }

    /**
     * create views in the menus for spell items and adds them to the menu
     * @param {{name: string, slot: number | null, src: string, unlocked: boolean}[]} spells
     */
    createSpellItems(spells){
        spells.sort((a, b) => {
            let number = 0;
            if(a.slot && !b.slot) number = -1;
            if(!a.slot && b.slot) number = 1;
            if(a.slot && b.slot) number = a.slot - b.slot;
            return number;
        });
        let items = [];
        for (let i = 0; i < spells.length; i++){
            if(spells[i].name === "BuildSpell") continue;
            items.push({
                item: {id: i, belongsIn: spells[i].slot ? "HotbarMenu" : "SpellsMenu", getItemId: () => spells[i].name, getDisplayName: () => spells[i].name},
                icon: {src: spells[i].src, width: 50, height: 50},
                description: "",
                extra: { //TODO: change this based on lvl
                    unlocked: this.playerInfo.availableSpells.includes(spells[i].name),
                    draggable: this.playerInfo.availableSpells.includes(spells[i].name)
                }
            });
        }
        this.addItems(items);
    }

    updateSpellItems(spells){
        for(let spell in spells){
            if(spells[spell] !== "BuildSpell") {
                this.items.get(spells[spell]).unlock();
            }
        }
    }
    /**
     * creates the buildSpell item (permanently in hotbar)
     */
    #createHotbarItem(){
        let buildSpell = {
            //TODO: SpellsMenu should be HotbarMenu but that gives an error
            item: {id: 0, belongsIn: "HotbarMenu", getItemId: () => "BuildSpell", getDisplayName: () => "build spell"},
            icon: {src: '/static/assets/images/spells/type2/BuildSpell.png', width: 50, height: 50},
            description: "",
            extra: {
                unlocked: true,
                draggable: false
            }
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
        if(this.menus.get(menu.name)) return false;

        this.#addMenuCallbacks(menu);

        this.menus.set(menu.name, menu);
        this.container.appendChild(this.menus.get(menu.name).element);
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
        //TODO: right now StakesMenu is hardcoded to be after AltarMenu, this should be dynamic (is important for the active state of the play button)
        this.#createMenus([AltarMenu, SpellsMenu, HotbarMenu, GemsMenu, StakesMenu, GemInsertMenu, StatsMenu, TowerMenu, MineMenu, FusionTableMenu, CombatBuildingsMenu, ResourceBuildingsMenu, DecorationsMenu, BuildMenu, CollectMenu, FuseInputMenu, MultiplayerStatsMenu, MultiplayerGemsMenu, MultiplayerMenu, PropMenu]);
        this.collectParams.meter = this.menus.get("CollectMenu").element.querySelector(".crystal-meter");
        this.#createStatMenuItems();
        this.#createBuildingItems();
        this.#createHotbarItem();
    }

    /**
     * render a menu and call the blockInputCallback.block function
     * @param {{name: string}} params - needs to contain the name of the menu to render + additional params for the arrangement of the menu (see menuManager.#arrangeMenus)
     */
    renderMenu(params){
        if(!params.name || !this.menusEnabled) return;
        if(this.currentMenu) this.#hideMenu(this.currentMenu);
        this.blockInputCallback.block();
        this.container.style.display = "block";
        this.currentMenu = params.name;
        this.#arrangeMenus(params);
        this.menus.get(params.name).allows.forEach(child => {
            this.menus.get(child).render();
        });
        this.playerCrystals = params.playerCrystals;
        this.menus.get(params.name).render();
    }

    /**
     * updates the current menu with the given params
     * currently only necessary for stats and BuildingItems
     * @param {{name: string, buildings: {building: string, placed: number, total: number}[] | null, stats: {Object} | null}} params
     */
    updateMenu(params){
        if(!params.name || !this.menusEnabled) return;
        if(!this.currentMenu) throw new Error("No menu is currently active");
        switch (params.name){
            case "TowerMenu":
            case "MineMenu":
            case "FusionTableMenu":
                this.#arrangeStatMenuItems(params);
                break;
            case "BuildMenu":
                this.#updateBuildingItems(params.buildings);
                break;
        }
    }

    /**
     * hide the current menu and call the blockInputCallback.activate function
     * @param {string} name
     */
    #hideMenu(name = this.currentMenu){
        if(!name || !this.menusEnabled) return;
        this.container.style.display = "none";
        if(name === "MineMenu"){
            clearInterval(this.collectInterval);
            this.collectInterval = null;
        }
        if(name === "MultiplayerMenu"){
            this.menus.get("MultiplayerGemsMenu").element.querySelectorAll(".menu-item").forEach(item => {
                this.moveItem(item.id, "GemsMenu");
            });
            this.stopConfetti();
        }
        this.currentMenu = null;
        this.menus.get(name).hide();
        this.menus.get(name).allows.forEach(child => {
            this.menus.get(child).hide();
        });
        this.blockInputCallback.activate();
    }

    /**
     * update the amount of crystals that appear in the CollectMenu
     * random crystal generation
     */
    updateCrystals(){
        this.collectParams.current = this.collectParams.current + this.collectParams.rate > this.collectParams.max ? this.collectParams.max : this.collectParams.current + this.collectParams.rate;
        this.collectParams.meter.style.width = `${(this.collectParams.current/this.collectParams.max)*100}%`;
        this.menus.get("CollectMenu").element.querySelector(".crystal-meter-text").innerText = `${this.collectParams.current}/${this.collectParams.max}`;        // random crystal generation
        if(Math.random()*100 < this.fortune){   // fortune amount is a percentage chance to get a gem each time a crystal is mined
            console.log("Gem mined!");
            this.dispatchEvent(this.createMineGemEvent());

        }
    }

    /**
     * move all gems from the StakesMenu to the GemsMenu
     */
    unstakeGems(){
        this.menus.get("StakesMenu").element.querySelector(".list-menu-ul").querySelectorAll(".menu-item").forEach(item => {
            this.items.get(item.id).attachTo(this.menus.get("GemsMenu"));
        });
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
        return ids.map(id => this.items.get(id));
    }

    /**
     * arrange menus in preparation for rendering
     * @param {{name: "AltarMenu"} |
     * {name: "BuildMenu", buildings: {building: string, placed: number, total: number}[]} |
     * {name: "TowerMenu" | "FusionTableMenu", gemIds: String[], slots: number, stats: Map} |
     * {name: "MineMenu", gemIds: String[], slots: number, crystals: number, maxCrystals: number, rate: number, stats: Map} |
     * {name: "MultiplayerMenu", gemIds: String[], result: "win" | "lose" | "draw", stats: {current: {name: string, value: number}[],
     * lifetime: {name: string, value: number}[]}}} params
     */
    #arrangeMenus(params){ //TODO: for mine put maxCrysals and rate as stats (capacity and mineSpeed)
        // arrange the menus in the container
        const icons = [];
        switch (params.name){
            case "AltarMenu":
                this.updateSpellItems(params.spells);
                this.#moveMenu("StakesMenu", "AltarMenu", "afterbegin");
                this.#moveMenu("GemsMenu", "AltarMenu", "afterbegin");
                this.#moveMenu("HotbarMenu", "AltarMenu", "afterbegin");
                this.#moveMenu("SpellsMenu", "AltarMenu", "afterbegin");
                this.checkStakes();
                break;
            case "TowerMenu":
                //TODO: show applied stats hide the others + change values based on the received params
                this.#arrangeStatMenuItems(params);
                this.#moveMenu("StatsMenu", "TowerMenu", "afterbegin");
                // show correct Gems based on received params
                this.menus.get("GemInsertMenu").renderSlots(params.slots);
                this.menus.get("GemInsertMenu").addSlotIcons(this.createSlotIcons(this.#getMenuItemsById(params.gemIds)));
                this.menus.get("TowerMenu").updateLvlUpButton(params);
                this.#moveMenu("GemInsertMenu", "TowerMenu", "afterbegin");
                this.#moveMenu("GemsMenu", "TowerMenu", "afterbegin");
                break;
            case "MineMenu":
                //TODO: show applied stats hide the others + change values based on the received params
                this.#arrangeStatMenuItems(params);
                params.crystals = this.collectParams.current;
                this.collectParams.max = Math.ceil(params.stats.get("capacity"));
                this.collectParams.rate = Math.ceil(params.stats.get("speed"))*10;
                this.fortune = params.stats.get("fortune");
                this.#moveMenu("StatsMenu", "MineMenu", "afterbegin");
                this.#moveMenu("CollectMenu", "MineMenu", "afterbegin");
                this.menus.get("CollectMenu").element.querySelector(".crystal-meter").style.width = `${(params.crystals/this.collectParams.max)*100}%`; //TODO: change this so text stays in the middle of the meter
                this.menus.get("CollectMenu").element.querySelector(".crystal-meter-text").innerText = `${params.crystals}/${this.collectParams.max}`;
                this.menus.get("MineMenu").updateLvlUpButton(params);
                this.collectParams.max = params.maxCrystals;
                this.collectParams.rate = params.rate;
                this.collectInterval = setInterval(this.updateCrystals.bind(this), 1000);

                // show correct Gems based on received params
                this.menus.get("GemInsertMenu").renderSlots(params.slots);
                this.menus.get("GemInsertMenu").addSlotIcons(this.createSlotIcons(this.#getMenuItemsById(params.gemIds)));
                this.#moveMenu("GemInsertMenu", "MineMenu", "afterbegin");
                this.#moveMenu("GemsMenu", "MineMenu", "afterbegin");
                break;
            case "FusionTableMenu":
                this.#arrangeStatMenuItems(params);
                this.#moveMenu("StatsMenu", "FusionTableMenu", "afterbegin");
                // show correct Gems based on received params
                this.menus.get("GemInsertMenu").renderSlots(params.slots);
                this.menus.get("GemInsertMenu").addSlotIcons(this.createSlotIcons(this.#getMenuItemsById(params.gemIds)));
                this.menus.get("FusionTableMenu").updateLvlUpButton(params);
                this.#moveMenu("GemInsertMenu", "FusionTableMenu", "afterbegin");
                this.#moveMenu("GemsMenu", "FusionTableMenu", "afterbegin");
                this.#moveMenu("FuseInputMenu", "FusionTableMenu", "afterbegin");
                break;
            case "BuildMenu":
                this.#updateBuildingItems(params.buildings);
                this.#moveMenu("DecorationsMenu", "BuildMenu", "afterbegin");
                this.#moveMenu("ResourceBuildingsMenu", "BuildMenu", "afterbegin");
                this.#moveMenu("CombatBuildingsMenu", "BuildMenu", "afterbegin");
                break;
            case "MultiplayerMenu":
                if(params.result === "win") this.startConfetti(150);
                this.menus.get("MultiplayerGemsMenu").setTitle(params.result);
                this.menus.get("MultiplayerStatsMenu").setStats(params.stats);
                this.menus.get("MultiplayerStatsMenu").toggleStats({target: this.menus.get("MultiplayerStatsMenu").element.querySelector("#multiplayer-match-button")});
                params.gemIds.forEach(id => {
                    this.moveItem(id, "MultiplayerGemsMenu");
                });
                this.#moveMenu("MultiplayerGemsMenu", "MultiplayerMenu", "afterbegin");
                this.#moveMenu("MultiplayerStatsMenu", "MultiplayerMenu", "afterbegin");
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