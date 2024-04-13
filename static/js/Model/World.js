import {Fireball, BuildSpell, ThunderCloud, Shield, IceWall} from "./Spell.js";
import {returnWorldToGridIndex} from "../helpers.js";

/**
 * World class that contains all the islands and the player
 */
export class World{
    constructor(params) {
        this.factory = params.factory;
        this.spellFactory = params.SpellFactory;
        this.collisionDetector = params.collisionDetector;
        this.islands = [];
        params.islands.forEach((island) => {
            this.islands.push(this.factory.createIsland(island.position,island.rotation, island.buildings));
        });
        this.player = this.factory.createPlayer(params.player);
        // Set default values for the inventory slots
        // TODO @Flynn: Change this to use the Spell.js#concreteSpellFromId() factory function
        this.player.changeEquippedSpell(0,new BuildSpell({}));
        this.player.changeEquippedSpell(1,new Fireball({}));
        this.player.changeEquippedSpell(2,new ThunderCloud({}));
        this.player.changeEquippedSpell(3,new Shield({}));
        this.player.changeEquippedSpell(4,new IceWall({}));
        this.entities = [];
        params.characters.forEach((character) => {});
        this.spellEntities = [];
        this.occupiedCells = [];
        document.addEventListener("selectCell", this.updatePreviewObjectColor.bind(this));
        document.addEventListener("useSelectedCell", this.sendInfoAboutSelectedCell.bind(this));
    }

    getIslandByPosition(position){
        for(const island of this.islands){
            if(position.x > island.min.x && position.x < island.max.x && position.z > island.min.z && position.z < island.max.z){
                return island;
            }
        }
        return null;
    }

    checkPosForBuilding(worldPosition){
        const island = this.getIslandByPosition(worldPosition);
        if(island){
            return island.checkCell(worldPosition);
        } else {
            return "void";
        }
    }

    //remove
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

    //remove
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

    /**
     *
     * @param buildingName
     * @param {THREE.Vector3} position - needs to be in world/grid coordinates
     * @param {Boolean} withTimer
     * @return {Building || null} - the building that was added to the world
     */
    addBuilding(buildingName, position, withTimer = false){
        const island = this.getIslandByPosition(position);
        if(island?.checkCell(position) === "empty"){
            const {x,z} = returnWorldToGridIndex(position);
            const building = this.factory.createBuilding(buildingName, {x: x, y: 0, z: z}, withTimer);
            island.addBuilding(building);
            return building;
        } else {
            console.log("no island/ there's already a building at the position");
        }
        console.log("failed to add new building to island, there is no island at the position");
        //TODO: throw error?
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
        //this.islands[0].buildings[this.islands[0].buildings.length-1].spellSpawner.update(deltaTime);
        this.collisionDetector.checkSpellEntityCollisions(deltaTime);
        this.spellFactory.models.forEach((model) => model.update(deltaTime));
        this.spellFactory.models = this.spellFactory.models.filter((model) => model.timer <= model.duration);
        // TODO: optimize cell occupation process
        this.islands.forEach((island) => island.updateOccupiedCells());
        // Get occupied cells from all islands
        this.occupiedCells = [];
        this.islands.forEach((island) => this.occupiedCells.push(...island.occupiedCells));
    }
}