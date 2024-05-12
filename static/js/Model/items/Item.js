import {amountOfGemIcons} from "../../configs/ViewConfigs.js";

export class Item{
    constructor(params) {
        this.id = params?.id ?? null;
        this.name = params.name;
        this.belongsIn = params.belongsIn; // E.g. gems (sub) menu
    }

    /**
     * used for getting an id formatted for the menus
     * @return {string}
     */
    getItemId(){
        return `${this.type}-${this.id}`;
    }

    /**
     * set the id of the item
     * @param {Object} data
     */
    setId(data){
        throw new Error("Cannot set id of abstract class Item");
    }

    /**
     * get display name of item
     * @return {*}
     */
    getDisplayName(){
        return this.name;
    }

    getDescription(){
        return "placeholder description babeeyy";
    }

    get type(){
        return "Abstract Item";
    }

    formatPOSTData(){
        return {
            id: this.id,
            type: this.name
        }
    }

    /**
     * Formats the data for a PUT request
     * @param {Array} changes - fields that have changed
     * @return {{id: *}}
     */
    formatPUTData(changes){
        return {
            id: this.id
        }
    }
}

export class Attribute extends Item{
    constructor(params) {
        super(params);
        this.multiplier = params?.multiplier ?? 1;
        this.belongsIn = "StatsMenu";
    }

    /**
     * Formats the data for a POST request
     * @return {{multiplier: (*|number|number), gem_attribute_id: *, gem_attribute_type}}
     */
    formatPOSTData() {
        return {
            gem_attribute_id: this.id,
            gem_attribute_type: this.name,
            multiplier: this.multiplier
        }
    }
}

export class Gem extends Item{
    constructor(params) {
        super(params);
        this.staked = params?.staked ?? false;
        this.power = params?.power ?? 0;
        this.attributes = [];
        this.equippedIn = params?.equippedIn ?? null; // Building id
        this.slot = params?.slot ?? null;
        this.belongsIn = (params?.staked ?? false) ? "StakesMenu" : "GemsMenu";
    }
    get type(){
        return "Gem";
    }

    getDescription(){
        let description = "";
        this.attributes.forEach(attribute => {
            description += `${attribute.name} x${Math.round(attribute.multiplier*100)/100} / `;
        });
        return description.slice(0, description.length-3);
    }

    addAttribute(attribute){
        const hasAttribute = this.attributes.find(attr => attr.name === attribute.name);
        if(hasAttribute){
            hasAttribute.multiplier += attribute.multiplier;
        } else {
            this.attributes.push(attribute);
        }
    }

    /**
     * Get the attributes of the gem
     * @return {Map<any, any>}
     */
    getAttributes(){
        let stats = new Map();
        this.attributes.forEach(attribute => {
            stats.set(attribute.name, attribute.multiplier);
        });
        return stats;
    }

    removeAttribute(type){
        this.attributes = this.attributes.filter(attribute => attribute.type !== type);
    }

    /**
     * Set the id of the gem
     * @param {Object} data
     */
    setId(data) {
        this.id = data.id;
    }

    /**
     * Formats the data for a POST request
     * @param playerInfo
     * @return {{id: *, type}}
     */
    formatPOSTData(playerInfo){
        let obj = super.formatPOSTData();
        obj.building_id = this.equippedIn;
        obj.player_id = playerInfo.userID;
        obj.attributes = [];
        this.attributes.forEach(attribute => {
            obj.attributes.push(attribute.formatPOSTData());
        });
        return obj;
    }

    /**
     * Formats the data for a PUT request
     * @param {Array} changes - fields that have changed
     * @return {{id: *, type}}
     */
    formatPUTData(changes) {
        let obj = super.formatPUTData();
        if(changes.includes("equippedIn")){
            obj.building_id = this.equippedIn;
        }
        if(changes.includes("staked")){
            obj.staked = this.staked;
        }
        return obj;
    }
}

//DO SPELLS NEED TO BE ITEMS?
export class Spell extends Item{
    constructor(params) {
        super(params);
    }
    get type(){
        return "Spell";
    }
}