export class MenuItem{
    constructor(params) {
        this.id = params.id;
        this.name = params.name;
        this.display = "block";
        this.belongsIn = params.belongsIn;
        this.icon = new Image(params.icon.width,params.icon.height);
        this.icon.src = params.icon.src;
        this.element = this.createElement(params);
    }

    render(){
        this.element.style.display = this.display;
    }

    hide(){
        this.element.style.display = "none";
    }

    detach(){
        this.element.parentNode.removeChild(this.element);
    }

    attachTo(parent){
        parent.addChild("afterbegin", this);
    }

    createElement(params){
        const element = document.createElement("li");
        const description = document.createElement("div");
        const descriptionName = document.createElement("p");
        const descriptionText = document.createElement("p");
        description.classList.add("menu-item-description");
        descriptionName.classList.add("menu-item-description-name");
        descriptionText.classList.add("menu-item-description-text");
        description.appendChild(descriptionName);
        description.appendChild(descriptionText);
        element.id = this.id;
        element.classList.add("menu-item");
        element.draggable = true;
        element.appendChild(this.icon);
        element.appendChild(description);
        descriptionName.innerText = this.name;
        descriptionText.innerText = params?.description ?? "placeholder description";
        return element;
    }

    get type(){
        return "undefined";
    }
}

export class SpellItem extends MenuItem{
    constructor(params) {
        super(params);
        this.unlocked = false;
        this.display = "flex";
    }

    render() {
        super.render();
    }

    unlock(params){
        this.unlocked = true;
        this.element.classList.add("unlocked");
        //add drag and drop callbacks
    }

    get type(){
        return "Spell";
    }
}

export class GemItem extends MenuItem{
    constructor(params) {
        super(params);
        this.equipped = params?.equipped ?? false;
        this.slot = params?.slot ?? null;
    }

    createElement(params) {
        const element =  super.createElement(params);
        console.log("gem menuitem:", params);
        if(params?.equipped) element.style.opacity = "0.5";
        return element;
    }

    get type(){
        return "Gem";
    }
}

export class BuildingItem extends MenuItem{
    constructor(params) {
        super(params);
        this.element.classList.add("building-item");
        this.element.draggable = false;
    }

    createElement(params) {
        const element = super.createElement(params);
        const descriptionName = element.querySelector(".menu-item-description-name");
        const descriptionText = element.querySelector(".menu-item-description-text");
        let description = "";
        // If there is this.extra.cost, add it to the name
        if(params?.extra?.cost) description += ` 💎 ${params.extra.cost}`;
        // If there is this.extra.buildTime, add it to the name
        if(params?.extra?.buildTime) description += ` ⌛ ${params.extra.buildTime}`;
        descriptionName.innerText += description;
        descriptionText.innerText = params?.description ?? "placeholder description";
        return element;
    }

    get type(){
        return "Building";
    }
}

export class CombatBuildingItem extends BuildingItem{
    constructor(params) {
        super(params);
    }

    get type(){
        return "CombatBuilding";
    }

}

export class ResourceBuildingItem extends BuildingItem{
    constructor(params) {
        super(params);
    }

    get type(){
        return "ResourceBuilding";
    }

}

export class DecorationBuildingItem extends BuildingItem{
    constructor(params) {
        super(params);
    }

    get type(){
        return "DecorationBuilding";
    }

}

export class StatItem extends MenuItem{
    constructor(params) {
        super(params);
        this.element.draggable = false;
        this.display = "flex";
        this.value = 0;
    }

    get type(){
        return "Stat";
    }
}