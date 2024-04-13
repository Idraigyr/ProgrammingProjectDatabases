import {Fireball, BuildSpell, ThunderCloud, Shield, IceWall} from "./Spell.js";
import {convertGridIndexToWorldPosition, convertWorldToGridPosition, returnWorldToGridIndex} from "../helpers.js";
import {buildTypes} from "../configs/Enums.js";
import {Bridge} from "./Bridge.js";
import * as THREE from "three";
import {MinionSpawner} from "./MinionSpawner.js";

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
            this.islands.push(this.factory.createIsland({position: island.position, rotation: island.rotation, buildingsList: island.buildings, width: 15, length: 15}));
        });
        this.player = this.factory.createPlayer(params.player);
        // Set default values for the inventory slots
        this.player.changeEquippedSpell(0,new BuildSpell({}));
        this.player.changeEquippedSpell(1,new Fireball({}));
        this.player.changeEquippedSpell(2,new ThunderCloud({}));
        this.player.changeEquippedSpell(3,new Shield({}));
        this.player.changeEquippedSpell(4,new IceWall({}));
        this.entities = [];
        params.characters.forEach((character) => {});
        this.spawners = [];
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

    getBuildingByPos(worldPosition){
        const island = this.getIslandByPosition(worldPosition);
        if(island){
            return island.getBuildingByPos(worldPosition);
        }
        return null;
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
        //buildTypes.getNumber("empty") is more readable than 1
        if(island?.checkCell(position) === buildTypes.getNumber("empty")){
            const {x,z} = returnWorldToGridIndex(position);
            const building = this.factory.createBuilding({
                buildingName: buildingName,
                position: {x: x, y: 0, z: z},
                withTimer: withTimer,
            });
            island.addBuilding(building);
            return building;
        } else {
            console.log("no island/ there's already a building at the position");
        }
        console.error("failed to add new building to island, there is no island at the position");
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
        this.spawners.forEach((spawner) => spawner.update(deltaTime));
        this.collisionDetector.checkSpellEntityCollisions(deltaTime);
        this.collisionDetector.checkCharacterCollisions(deltaTime);
        this.spellFactory.models.forEach((model) => model.update(deltaTime));
        this.spellFactory.models = this.spellFactory.models.filter((model) => model.timer <= model.duration);
    }
}