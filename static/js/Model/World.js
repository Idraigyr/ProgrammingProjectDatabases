import {Factory} from "../Controller/Factory.js";
import {Fireball, BuildSpell, ThunderCloud, Shield} from "./Spell.js";
import {BuildManager} from "../Controller/BuildManager.js";

/**
 * World class that contains all the islands and the player
 */
export class World{
    constructor(params) {
        this.factory = params.Factory;
        this.spellFactory = params.SpellFactory;
        this.islands = [];
        params.islands.forEach((island) => {
            this.islands.push(this.factory.createIsland(island.position,island.rotation, island.buildings));
        });
        this.player = this.factory.createPlayer(params.player.position);
        // Set default values for the inventory slots
        this.player.changeEquippedSpell(0,new BuildSpell({}));
        this.player.changeEquippedSpell(1,new Fireball({}));
        this.player.changeEquippedSpell(2,new ThunderCloud({}));
        this.player.changeEquippedSpell(3,new Shield({}));
        this.entities = [];
        params.characters.forEach((character) => {});
        this.spellEntities = [];
        this.occupiedCells = [];
        document.addEventListener("selectCell", this.updatePreviewObjectColor.bind(this));
        document.addEventListener("useSelectedCell", this.sendInfoAboutSelectedCell.bind(this));
    }

    sendInfoAboutSelectedCell(event){
        // Get position from event
        let position = event.detail.position;
        // Check if the position is occupied
        let occupied = this.occupiedCells.some((cell) => cell.x === position.x && cell.z === position.z);
        // If occupied, get the building
        let building = this.occupiedCells.find((cell) => cell.x === position.x && cell.z === position.z)?.building;
        // Dispatch event with the information
        let details = event.detail;
        details.occupied = occupied;
        details.building = building;
        document.dispatchEvent(new CustomEvent("infoAboutSelectedCell", {detail: details}));
    }

    updatePreviewObjectColor(event){
        // Get position from event
        let position = event.detail.position;
        // Check if the position is occupied
        let occupied = this.occupiedCells.some((cell) => cell.x === position.x && cell.z === position.z);
        // If occupied, change the color of the preview object to red
        // If not occupied, change the color of the preview object to green
        let primaryColor = occupied ? 0x0000CC : 0xD46D01;
        let secondaryColor = occupied ? 0x0000FF : 0xFFB23D;
        // Set the color of the preview object
        document.dispatchEvent(new CustomEvent("updatePreviewObjectColor", {detail: {primaryColor: primaryColor, secondaryColor: secondaryColor}}));
    }

    addBuilding(buildingName, position){
        const building = this.factory.createBuilding(buildingName, position);
        // TODO: what if multiple islands?
        this.islands[0].addBuilding(building);
    }

    exportWorld(json){

    }

    importWorld(json){

    }

    /**
     * Update the world and all its components
     * @param deltaTime
     */
    update(deltaTime){
        //update whole model
        this.spellFactory.models.forEach((model) => model.update(deltaTime));
        this.spellFactory.models = this.spellFactory.models.filter((model) => model.timer <= model.duration);
        // TODO: optimize cell occupation process
        this.islands.forEach((island) => island.updateOccupiedCells());
        // Get occupied cells from all islands
        this.occupiedCells = [];
        this.islands.forEach((island) => this.occupiedCells.push(...island.occupiedCells));
    }
}