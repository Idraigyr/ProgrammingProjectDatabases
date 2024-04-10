import {Fireball, BuildSpell, ThunderCloud, Shield, IceWall} from "./Spell.js";
import {convertGridIndexToWorldPosition, convertWorldToGridPosition, returnWorldToGridIndex} from "../helpers.js";
import {buildTypes} from "../configs/Enums.js";
import {Bridge} from "./Bridge.js";
import * as THREE from "three";

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
        this.islands.push(new Bridge({position: convertGridIndexToWorldPosition(new THREE.Vector3(-7,0,-9)), rotation: 0, width: 3, length: 3, height: 0}));
        this.player = this.factory.createPlayer(params.player);
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

    getIslandByPosition(position){
        for(const island of this.islands){
            //TODO: if min and max are center positions of most extremes cells do +gridCellSize/2
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
            return buildTypes.getNumber("void");
        }
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
        console.log(island?.checkCell(position));
        //buildTypes.getNumber("empty") is more readable than 1
        if(island?.checkCell(position) === buildTypes.getNumber("empty")){
            const {x,z} = returnWorldToGridIndex(position);
            const building = this.factory.createBuilding(buildingName, {x: x, y: 0, z: z}, withTimer);
            console.log("building: ", building)
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
    }
}