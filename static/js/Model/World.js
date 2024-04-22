import {returnWorldToGridIndex} from "../helpers.js";
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
        this.player = null;
        this.entities = [];
        this.spawners = [];
    }

    addIsland(island){
        //TODO: if this.islands is not empty, place the new island in a way that it doesn't overlap with the existing islands
        //+ add a bridge already?
        this.islands.push(island);
    }

    addEntity(entity){
        this.entities.push(entity);
    }

    addPlayer(player){
        this.player = player;
    }

    /**
     * Get island by position
     * @param position - position in world coordinates
     * @returns {*|null} - the island at the position or null if there is no island at the position
     */
    getIslandByPosition(position){
        console.log("getIslandByPosition: position", position);
        for(const island of this.islands){
            //TODO: if min and max are center positions of most extremes cells do +gridCellSize/2 (depends on implementation of Foundation class)
            if(position.x > island.min.x && position.x < island.max.x && position.z > island.min.z && position.z < island.max.z){
                return island;
            }
        }
        return null;
    }

    /**
     * Get the building at the position
     * @param position - position in world coordinates
     * @returns {*|null} - the building at the position or null if there is no building
     */
    getBuildingByPosition(position){
        const island = this.getIslandByPosition(position);
        console.log("getIslandByPosition result:", island);
        if(island){
            return island.getBuildingByPosition(position);
        }
        return null;
    }

    /**
     * Return type of building at worldPosition
     * @param worldPosition - position in world coordinates
     * @returns {*} - the type of building at the position
     */
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
        //buildTypes.getNumber("empty") is more readable than 1
        if(island?.checkCell(position) === buildTypes.getNumber("empty")){
            const {x,z} = returnWorldToGridIndex(position.sub(island.position));
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

    /**
     * Export the world to a json object
     * @param json - the json object to export to
     */
    exportWorld(json){

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