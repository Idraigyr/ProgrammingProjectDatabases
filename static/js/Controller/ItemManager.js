import {Attribute, Gem} from "../Model/items/Item.js";
import {API_URL, gemAttributesURI, gemURI, postRetries} from "../configs/EndpointConfigs.js";
import {powerScaling} from "../configs/ControllerConfigs.js";
import {gemTypes} from "../configs/Enums.js";

/**
 * Class for managing items in menu's
 */
export class ItemManager {
    /**
     * Constructor for the ItemManager
     * @param {{playerInfo: PlayerInfo}} params - parameters for the ItemManager
     */
    constructor(params) {
        this.gems = [];
        this.gemAttributes = [];
        this.playerInfo = params.playerInfo;
        this.dbRequests = [];

        this.persistent = false;
    }

    /**
     * retrieve gem attributes from the database
     */
    async retrieveGemAttributes(){
        const response = await $.getJSON(`${API_URL}/${gemAttributesURI}`);
        if(response){
            this.gemAttributes = response;
            console.log("Gem attributes retrieved: ", this.gemAttributes);
        } else {
            throw new Error("Could not retrieve gem attributes");
        }
    }

    /**
     * return all gems equipped in a building
     * @param {number} buildingId
     * @return {Gem[]}
     */
    getGemsEquippedInBuilding(buildingId){
        return this.gems.filter(gem => gem.equippedIn === buildingId);
    }

    /**
     * return all gem ids equipped in a building formatted for use in the menuManager
     * @param buildingId
     * @return {string[]}
     */
    getItemIdsForBuilding(buildingId){
        return this.getGemsEquippedInBuilding(buildingId).map(gem => gem.getItemId());
    }


    /**
     * converts a view id to a gem id (i.e. Gem-1 to 1). see menuManager for more information about view id
     * @param viewId
     * @return {number}
     */
    #convertViewIdToGemId(viewId){
        return Number.parseInt(viewId.substring(viewId.lastIndexOf("-") + 1), 10);
    }

    /**
     * Add a gem to a building
     * @param {{detail: {id: number, building: Placeable, slot: number}}} event
     */
    addGem(event){
        const gem = this.#getGemById(this.#convertViewIdToGemId(event.detail.id));
        if(gem) {
            gem.equippedIn = event.detail.building.id;
            gem.slot = event.slot;
            event.detail.building.addGem(gem.id);
        }
        else throw new Error("Gem with id " + event.detail.id + " doesn't exist.");
    }

    /**
     * Remove a gem from a building
     * @param {{detail: {id: number, building: Placeable}}} event
     */
    removeGem(event){
        const gem = this.#getGemById(this.#convertViewIdToGemId(event.detail.id));
        // Remove the gem to the building
        if(gem) {
            gem.equippedIn = null;
            gem.slot = null;
            event.detail.building.removeGem(gem.id);
        }
        else throw new Error("Gem with id " + event.detail.id + " doesn't exist.");
    }

    // Generate a random number for gem power
    #generateRandomNumber() { //TODO: why exponential distribution?
        // lambda parameter for the exponential distribution
        const lambda = 0.03;

        const randomNumber = -Math.log(Math.random()) / lambda;

        // set random number to the range [1, 100]
        const scaledNumber = Math.floor(randomNumber) % 100 + 1;

        return scaledNumber;
    }

    /**
     * Get an item by its id
     * @param {number} id
     * @return {*}
     */
    #getGemById(id){
        return this.gems.find(item => item.id === id);
    }

    /**
     * Generate a power number for a gem based on the player level and fusion level
     * @param {number} playerLvl
     * @param {number} fusionLvl
     * @return {number}
     */
    #generatePowerNumber(playerLvl, fusionLvl) {
        const power = Math.floor(Math.random() * (playerLvl + fusionLvl) * powerScaling) + 1;
        return power;
    }

    /**
     * Generate a random attribute based on the gemAttributes array filled with attributes from the database
     * @return {Attribute}
     */
    #generateRandomAttribute() {
        const index = Math.floor(Math.random() * this.gemAttributes.length);
        return new Attribute({id: this.gemAttributes[index].id, name: this.gemAttributes[index].type});
    }

    //TODO: forward equipped gem info from a building to the MenuManager when opening the building's menu
    /**
     * Check the equipped gems in a building
     * @param {number} buildingId
     */
    getEquippedGems(buildingId){
        const equippedGems = this.gems.filter(item => item.equippedIn === buildingId);
        let menuItems = equippedGems.map(this.#itemToMenuItem);
    }

    /**
     *
     * @param item
     * @return {{item, icon: {src: string, width: number, height: number}}}
     */
    #itemToMenuItem(item){
        // TODO: advanced options for the icon
        return {
            item: item,
            description: item.getDescription(),
            icon: {
                src: "https://via.placeholder.com/50",
                width: 50,
                height: 50
            }
        };
    }

    /**
     * Add new post request to the postRequests array
     * @param gem - the gem to add to the postRequests array
     * @returns {number} - the index of the request in the postRequests array
     */
    insertPendingRequest(gem){
        for (let i = 0; i < this.dbRequests.length; i++){
            if(this.dbRequests[i] === null){
                this.dbRequests[i] = gem;
                return i;
            }
        }
        this.dbRequests.push(gem);
        return this.dbRequests.length - 1;
    }

    /**
     * Removes post request from the postRequests array
     * @param index - the index of the request in the postRequests array
     */
    removePendingRequest(index){
        this.dbRequests[index] = null;
        while(this.dbRequests[this.dbRequests.length - 1] === null){
            this.dbRequests.pop();
        }
    }

    /**
     * Send a POST request to the server
     * @param {String} uri - the URI to send the POST request to
     * @param {Gem} gem - the gem that we want to add to the db
     * @param {Number} retries - the number of retries to resend the POST request
     * @param {Number} requestIndex - the index of the gem in the dbRequests array (used to remove the request from the array) use insertPendingRequest to get the index
     * @returns {Promise<void>}
     */
    sendPOST(uri, gem, retries, requestIndex){
        try {
            $.ajax({
                url: `${API_URL}/${uri}`,
                type: "POST",
                data: JSON.stringify(gem.formatPOSTData(this.playerInfo)),
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.error(e);
                }
            }).done((data, textStatus, jqXHR) => {
                console.log("POST success");
                console.log(textStatus, data);
                gem.setId(data);
                this.removePendingRequest(requestIndex);
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log("POST fail");
                if (retries > 0){
                    this.sendPOST(uri, gem, retries - 1, requestIndex);
                } else {
                    throw new Error(`Could not send POST request for building: Error: ${textStatus} ${errorThrown}`);
                    //TODO: popup message to user that gem could not be created, bad connection? should POST acknowledgment be before or after model update?
                }
            });
        } catch (err){
            console.error(err);
        }
    }

    //TODO: add a new gem + add it's corresponding view in MenuManager (for fuse menu)
    /**
     * Create a gem, add it to the database and add it to the menuManager
     * @param {number} fusionLevel
     */
    createGem(fusionLevel){
        console.log("Creating gem");
        // Push item with params
        let power = this.#generatePowerNumber(this.playerInfo.level, fusionLevel);
        const viewType = Math.floor(Math.random() * gemTypes.getSize);
        const params = {
            fusionLevel: fusionLevel,
            power: power,
            viewType: viewType,
            name: gemTypes.getName(viewType),
        };
        const gem = new Gem(params);

        const maxAttributes = 3; //TODO: change this depending on player level
        const maxMultiplier = 3; //TODO: change this depending on player level
        const minMultiplier = 1; //TODO: change this depending on player level

        const numberOfAttributes = Math.floor(Math.random() * maxAttributes) + 1;

        //assign random attributes to the gem with a combined power of power
        for(let i = 1; i < numberOfAttributes; i++){
            gem.addAttribute(this.#generateRandomAttribute());
            const multiplier = Math.random() * (maxMultiplier - minMultiplier) + minMultiplier;
            if(multiplier > power) break;
            gem.attributes[i - 1].multiplier = multiplier;
            power -= multiplier;
        }
        gem.attributes.push(this.#generateRandomAttribute());
        gem.attributes[gem.attributes.length - 1].multiplier = power;
        console.log(gem);

        if(this.persistent){
            this.sendPOST(gemURI, gem, postRetries, this.insertPendingRequest(gem));
        } else { //TODO: remove, this is for testing purposes
            gem.setId({id: counter()});
        }
        this.gems.push(gem);
        return gem;
    }


}

const counter = (function (){
    let count = 0;
    return function (){
        return count++;
    }
})();