import {Gem} from "../Model/items/Item.js";
import {API_URL} from "../configs/EndpointConfigs.js";

/**
 * Class for managing items in menu's
 */
export class ItemManager {
    /**
     * Constructor for the ItemManager
     */
    constructor() {
        this.items = []; // map building -> items or property in item
        this.spells = [];
        this.gems = [];
        this.stakes = [];
        this.menuManager = null;
    }

    // Equip a gem into a building
    /**
     * Add a gem to a building
     * @param {{detail: {id: number, building: Placeable}}} event
     */
    addGem(event){
        // Get id of gem
        let gemId = event.detail.id;
        // Get building id
        let buildingId = event.detail.building?.id;
        // Get the gem
        let item = this.#getItemById(gemId);
        // Add the gem to the building
        item.equippedIn = buildingId;
    }

    /**
     * Get an item by its id
     * @param {number} id
     * @return {*}
     */
    #getItemById(id){
        return this.items.find(item => item.id === id);
    }

    //TODO: unequip a gem from a building
    /**
     * Remove a gem from a building
     * @param {{detail: {id: number}}} event
     */
    removeGem(event){
        // Get id of gem
        let gemId = event.detail.id;
        // Get the gem
        let item = this.#getItemById(gemId);
        // Remove the gem to the building
        item.equippedIn = null;
    }

    //TODO: forward equipped gem info from a building to the MenuManager when opening the building's menu
    /**
     * Check the equipped gems in a building
     * @param {Placeable} building
     */
    checkEquippedGems(building){
        // Get id of the building
        let buildingId = building.id;
        // Give error if building doesn't exist
        if(!buildingId) throw new Error("Building with id " + buildingId + " doesn't exist.");
        // Get the gems equipped in the building
        let equippedGems = this.items.filter(item => item.equippedIn === buildingId);
        let menuItems = equippedGems.map(this.#itemToMenuItem);
        // Forward the equipped gems to the MenuManager
        this.menuManager.addItems(menuItems); //TODO: remove this!! addItems of menuManager may only be called on new Item creation / on game initialisation from db
    }

    /**
     *
     * @param item
     * @return {{item, icon: {src: string, width: number, height: number}}}
     */
    #itemToMenuItem(item){
        // TODO: advanced options for the icon
        return {item: item, icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}};
    }

    //TODO: add a new gem + add it's corresponding view in MenuManager (for fuse menu)
    createGem(event){
        // Push item with params
        this.items.push(new Gem(event.detail));
        // Post item to db
        let response = $.ajax({
                url: `${API_URL}/gem`,
                type: "POST",
            // TODO: test if the id in response is null (if so, check Item.js get json())
                data: JSON.stringify(this.items[this.items.length - 1].json),
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.log(e);
                }
            }).done((data, textStatus, jqXHR) => {
                console.log("POST success in ItemManager.createGem");
                console.log(textStatus, data);
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log("POST fail in ItemManager.createGem");
            });
        // Set id
        this.items[this.items.length - 1].id = response.getJSON.id;
        // Add menu item view in menuManager
        this.menuManager.addItem(this.#itemToMenuItem(this.items[this.items.length - 1]));
    }


}