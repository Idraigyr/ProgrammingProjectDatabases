import {Factory} from "../Controller/Factory.js";
import {Fireball, BuildSpell, ThunderCloud, Shield} from "./Spell.js";
import {BuildManager} from "../Controller/BuildManager.js";
import * as THREE from "three";
import {physicsSteps} from "../configs/ControllerConfigs.js";

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
        this.player = this.factory.createPlayer({position: params.player.position});
        // Set default values for the inventory slots
        this.player.changeEquippedSpell(0,new BuildSpell({}));
        this.player.changeEquippedSpell(1,new Fireball({}));
        this.player.changeEquippedSpell(2,new ThunderCloud({}));
        this.player.changeEquippedSpell(3,new Shield({}));
        this.entities = [];
        params.characters.forEach((character) => {});
        this.spellEntities = [];

        this.islands[0].buildings.push(this.factory.createTower({position: {x: -10, y: 0, z: -10}}));
        this.islands[0].buildings[this.islands[0].buildings.length-1].spellSpawner.setSpell(new Fireball({velocity: 20}), {position: new THREE.Vector3(-10,10,-10), direction: new THREE.Vector3(10,-2,0), team: 1});
        this.islands[0].buildings[this.islands[0].buildings.length-1].spellSpawner.addEventListener("spawnSpell", this.spellFactory.createSpell.bind(this.spellFactory));
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
        this.islands[0].buildings[this.islands[0].buildings.length-1].spellSpawner.update(deltaTime);
        this.collisionDetector.checkSpellEntityCollisions();
        this.spellFactory.models.forEach((model) => model.update(deltaTime));
        this.spellFactory.models = this.spellFactory.models.filter((model) => model.timer <= model.duration);
    }
}