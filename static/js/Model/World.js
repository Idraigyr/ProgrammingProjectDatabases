import {Factory} from "../Controller/Factory.js";
import {Fireball, BuildSpell, ThunderCloud, Shield, IceWall} from "./Spell.js";
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
        this.player.changeEquippedSpell(4,new IceWall({}));
        this.entities = [];
        params.characters.forEach((character) => {});
        this.spellEntities = [];
    }

    addBuilding(buildingName, position){
        const building = this.factory.createBuilding(buildingName, position);
        // TODO: what if multiple islands?
        this.islands[0].buildings.push(building);
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
    }
}