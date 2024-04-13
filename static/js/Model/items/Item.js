export class Item{
    constructor(params) {
        this.id = params.id;
        this.name = params.name;
        this.belongsIn = params.belongsIn;
        this.equippedIn = params?.equippedIn ?? null;
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