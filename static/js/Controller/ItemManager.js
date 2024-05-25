import {Attribute, Gem, Spell} from "../Model/items/Item.js";
import {API_URL, gemAttributesURI, gemURI, postRetries, spellListURI} from "../configs/EndpointConfigs.js";
import {minTotalPowerForStakes, powerScaling} from "../configs/ControllerConfigs.js";
import {gemTypes} from "../configs/Enums.js";
import {spellTypes} from "../Model/Spell.js";

/**
 * Class for managing items in menu's
 */
export class ItemManager {
    /**
     * Constructor for the ItemManager
     * @param {{playerInfo: PlayerInfo, menuManager: MenuManager}} params - parameters for the ItemManager
     */
    constructor(params) {
        this.gems = [];
        this.spells = [];
        this.gemAttributes = [];
        this.playerInfo = params.playerInfo;
        this.menuManager = params.menuManager;
        this.dbRequests = [];

        this.persistent = true;
    }

    /**
     * retrieve gem attributes from the database
     */
    async retrieveGemAttributes(){
        const response = await $.getJSON(`${API_URL}/${gemAttributesURI}`);
        if(response){
            this.gemAttributes = response;
        } else {
            throw new Error("Could not retrieve gem attributes");
        }
    }

    async retrieveSpells(){
        const response = await $.getJSON(`${API_URL}/${spellListURI}`);
        if(response){
            for(let i = 0; i < response.length; i++){
                this.spells.push(new Spell({
                    id: response[i].id,
                    name: response[i].name,
                }));
            }
        } else {
            throw new Error("Could not retrieve spells");
        }
    }

    /**
     * creates gem models based on gem data from the database,
     * currenly gems that are equipped in a building are added chronologicaly to the building so slot positions are not preserved between sessions
     * (db currently does not store slot positions)
     * @param {Object[]} gems
     */
    createGemModels(gems){
        const buildingSlots = new Map();
        for (let i = 0; i < gems.length; i++){
            const params = gems[i];
            let slot = buildingSlots.get(params.building_id) ?? -1;
            buildingSlots.set(params.building_id, slot + 1);
            const gem = new Gem({
                id: params.id,
                equippedIn: params.building_id,
                slot: buildingSlots.get(params.building_id),
                name: params.type,
                staked: params.staked
            });
            //add attributes and total power to the gem
            let power = 0;
            for(let j = 0; j < gems[i].attributes.length; j++){
                const params = gems[i].attributes[j];
                gem.addAttribute(new Attribute({
                    id: params.gem_attribute_id,
                    name: params.gem_attribute_type,
                    multiplier: params.multiplier
                }));
                power += params.multiplier; //TODO: change this if power calculation changes
            }
            gem.power = power;
            this.gems.push(gem);
        }
    }

    /**
     * adds new gem models to the itemManager for gems from the gems parameter that are not already in the itemManager
     * @param {Object[]} gems
     * @return {Object[]} - the view parameters for the new gems
     */
    updateGems(gems){
        const newGems = gems.filter(params => !this.gems.some(gem => gem.id === params.id));
        this.createGemModels(newGems);
        return this.getGemsViewParams().filter(gemViewParams => newGems.some(params => params.id === gemViewParams.item.id));
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
     * return all gem ids formatted for use in the menuManager
     * @return {{item: *, extra: {equipped: boolean}, icon: {src: *, width: number, height: number}, description: *}[]}
     */
    getGemsViewParams(){
        return this.gems.map(gem => {
            return {
                item: gem,
                icon: {src: gemTypes.getIcon(gemTypes.getNumber(gem.name)), width: 50, height: 50},
                description: gem.getDescription(),
                extra: {
                    equipped: gem.equippedIn !== null,
                    slot: gem.slot
                }
            }
        });
    }

    getSpellsViewParams(){
        return this.spells.map(spell => {
            return {
                item: spell,
                icon: {src: spellTypes.getIcon(spell.name), width: 50, height: 50},
                description: spell.getDescription(),
                extra: {
                    unlocked: spell.unlocked
                }
            }
        });
    }

    /**
     * returns a map of the stat multipliers of all gems equipped in a building
     * @param buildingId
     * @return {Map<any, any>}
     */
    getBuildingStatMultipliers(buildingId){
        let stats = new Map();
        let gems = this.getGemsEquippedInBuilding(buildingId);
        for (let i = 0; i < gems.length; i++){
            for (let j = 0; j < gems[i].attributes.length; j++){
                stats.set(gems[i].attributes[j].name, (stats.get(gems[i].attributes[j].name) ?? 0) + gems[i].attributes[j].multiplier);
            }
        }
        return stats;
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
     * sets a gem as staked in the db based on if it's in the gems menu or not
     * @param {string[]} gemIds - the ids of the gems to stake in menuManager format
     * @param {boolean} unstake - if true, unstake the gems
     */
    stakeGems(gemIds){
        const gems = gemIds.map(id => this.getGemById(this.#convertViewIdToGemId(id)));
        const contained = false;
        let powerStaked = 0;
        this.gems.forEach(gem => {
            const contained = gems.includes(gem);
            if(!contained) powerStaked += gem.power;
            if((!gem.staked && contained) || (gem.staked && !contained)) return;
            gem.staked = !gem.staked;
            this.sendPUT(gemURI, gem, postRetries, this.insertPendingRequest(gem), ["staked"]);
        });
        return powerStaked >= minTotalPowerForStakes.getStakesForLvl(this.playerInfo.level);
    }

    checkStakedGems(){
        let powerStaked = 0;
        this.gems.forEach(gem => {
            if(gem.staked) powerStaked += gem.power;
        });
        return powerStaked >= minTotalPowerForStakes.getStakesForLvl(this.playerInfo.level);
    }

    /**
     * returns all staked gems
     */
    getStakedGems(){
        return this.gems.filter(gem => gem.staked);
    }

    /**
     * removes gem from the model without changing the db
     * @param gemId
     */
    deleteGem(gemId){
        this.gems.filter(gem => gem.id !== gemId);
    }

    /**
     * Add a gem to a building
     * @param {{detail: {id: number, building: Placeable, slot: number}}} event
     */
    addGem(event){
        const gem = this.getGemById(this.#convertViewIdToGemId(event.detail.id));
        if(gem) {
            gem.equippedIn = event.detail.building.id;
            gem.slot = event.slot;
            event.detail.building.addGem(gem);
            this.sendPUT(gemURI, gem, postRetries, this.insertPendingRequest(gem), ["equippedIn"]);
        }
        else throw new Error("Gem with id " + event.detail.id + " doesn't exist.");
    }

    /**
     * Remove a gem from a building
     * @param {{detail: {id: number, building: Placeable}}} event
     */
    removeGem(event){
        const gem = this.getGemById(this.#convertViewIdToGemId(event.detail.id));
        // Remove the gem to the building
        if(gem) {
            gem.equippedIn = null;
            gem.slot = null;
            event.detail.building.removeGem(gem);
            this.sendPUT(gemURI, gem, postRetries, this.insertPendingRequest(gem), ["equippedIn"]);
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
    getGemById(id){
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
                this.menuManager.addItem({item: gem, icon: {src: gemTypes.getIcon(gemTypes.getNumber(gem.name)), width: 50, height: 50}, description: gem.getDescription()});
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

    /**
     * Send a PUT request to the server
     * @param {String} uri - the URI to send the POST request to
     * @param {Gem} gem - the gem that we want to update
     * @param {Number} retries - the number of retries to resend the POST request
     * @param {Number} requestIndex - the index of the gem in the dbRequests array (used to remove the request from the array) use insertPendingRequest to get the index
     * @param {string[]} changes - the changes that we want to update in the db
     * @returns {Promise<void>}
     */
    sendPUT(uri, gem, retries, requestIndex, changes = []){
        console.log("Sending PUT request: ", gem.formatPUTData(changes));
        try {
            $.ajax({
                url: `${API_URL}/${uri}`,
                type: "PUT",
                data: JSON.stringify(gem.formatPUTData(changes)),
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.error(e);
                }
            }).done((data, textStatus, jqXHR) => {
                console.log("PUT success");
                console.log(textStatus, data);
                this.removePendingRequest(requestIndex);
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log("PUT fail");
                if (retries > 0){
                    this.sendPUT(uri, gem, retries - 1, requestIndex);
                } else {
                    throw new Error(`Could not send PUT request for building: Error: ${textStatus} ${errorThrown}`);
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
        console.log("Fusion level: ", fusionLevel);
        // Push item with params
        let power = this.#generatePowerNumber(this.playerInfo.level, fusionLevel);
        console.log("Power: ", power)
        const viewType = Math.floor(Math.random() * gemTypes.getSize);
        const params = {
            power: power,
            name: gemTypes.getName(viewType),
        };
        const gem = new Gem(params);

        const maxAttributes = Math.min(this.gemAttributes.length, Math.floor(this.playerInfo.getLevel()/4)); //TODO: change this depending on player level
        const maxMultiplier = 1.75 + 0.2*(this.playerInfo.getLevel()-1) + 0.4 * fusionLevel-1; //TODO: change this depending on player level
        const minMultiplier = 1.25 + 0.1*(this.playerInfo.getLevel()-1) + 0.1 * fusionLevel-1; //TODO: change this depending on player level

        const numberOfAttributes = Math.floor(Math.random() * maxAttributes) + 1;

        //assign random attributes to the gem with a combined power of power
        for(let i = 1; i < numberOfAttributes; i++){
            gem.addAttribute(this.#generateRandomAttribute());
            const multiplier = Math.random() * (maxMultiplier - minMultiplier) + minMultiplier;
            if(multiplier > power) break;
            gem.attributes[i - 1].multiplier = multiplier;
            if (multiplier >= 1) {
                power -= multiplier;
            }
        }
        gem.attributes.push(this.#generateRandomAttribute());
        gem.attributes[gem.attributes.length - 1].multiplier = power;

        if(this.persistent){
            this.sendPOST(gemURI, gem, postRetries, this.insertPendingRequest(gem));
        }
        this.gems.push(gem);
        this.menuManager.toggleAnimation(false);
        return gem;
    }


}

const counter = (function (){
    let count = 0;
    return function (){
        return count++;
    }
})();