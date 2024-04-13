export class Item{
    constructor(params) {
        this.id = params.id;
        this.name = params.name;
        this.belongsIn = params.belongsIn; // E.g. gems (sub) menu
        this.equippedIn = params?.equippedIn ?? null; // Building id
    }

    getItemId(){
        return `${this.type}${this.id}`;
    }

    getDisplayName(){
        return this.name;
    }

    get type(){
        return "Abstract Item";
    }
}

export class Gem extends Item{
    constructor(params) {
        super(params);
    }
    get type(){
        return "Gem";
    }
    get json(){
        // TODO: do this properly
        return {
            id: this.id,
            type: this.name,
            building_id: this.equippedIn,
            attributes: [{
                gem_attribute_id: 0,
                gem_attribute_type: "none",
                multiplier: 1
            }]
        }
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