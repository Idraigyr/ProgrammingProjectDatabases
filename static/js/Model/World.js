import {convertWorldToGridPosition} from "../helpers.js";
import {buildTypes} from "../configs/Enums.js";
import {gridCellSize} from "../configs/ViewConfigs.js";
import {Bridge} from "./Entities/Foundations/Bridge.js";
import {Island} from "./Entities/Foundations/Island.js";
import {SpellSpawner} from "./Spawners/SpellSpawner.js";
import {Fireball} from "./Spell.js";

/**
 * World class that contains all the islands and the player
 */
export class World{
    constructor(params) {
        this.factory = params.factory;
        this.spellFactory = params.SpellFactory;
        this.collisionDetector = params.collisionDetector;
        this.islands = []; //TODO: rename to this.islands to this.foundations and all related properties/methods
        this.player = null;
        this.entities = [];
        this.spawners = {minions: [], spells: []};
    }

    /**
     * Remove all entities of a certain team + all bridges
     * @param team
     */
    removeEntitiesByTeam(team){
        this.entities = this.entities.filter((entity) => {
            if(entity.team === team){
                entity.dispose();
                return false;
            }
            return true;
        });

        this.islands = this.islands.filter((island) => {
            if(island.team === team || island instanceof Bridge){
                island.dispose();
                return false;
            }
            return true;
        });

        this.spellFactory.models.forEach((model) => {
            model.dispose();
        });
        this.spellFactory.models = [];
    }

    /**
     * Get all proxys in the world
     * @return {ProxyEntity[]}
     */
    getProxys(){
        let proxys = [];
        this.islands.forEach((island) => {
            if(island instanceof Island) proxys = proxys.concat(island.proxys);
        });
        return proxys;
    }

    /**
     * Remove all proxys from the islands
     */
    removeProxys(){
        this.islands.forEach((island) => {
            if(island instanceof Island) island.disposeProxys();
        });
    }

    /**
     * add a foundation to the world
     * @param {Foundation} island
     */
    addIsland(island){
        this.islands.push(island);
    }

    removeIslands(){
        this.islands.forEach((island) => island.dispose());
        this.islands = [];
    }

    /**
     * Add an entity to the world
     * @param {Entity} entity
     */
    addEntity(entity){
        this.entities.push(entity);
    }

    /**
     * set the player of the world
     * @param player
     */
    setPlayer(player){
        this.player = player;
    }

    /**
     * Add a minion spawner to the world
     * @param {MinionSpawner} spawner
     */
    addMinionSpawner(spawner){
        spawner.addEventListener("delete", (event) => {
            this.spawners.spells = this.spawners.spells.filter((spawner) => spawner !== event.detail.model);
        });
        this.spawners.minions.push(spawner);
    }

    /**
     * Add a spell spawner to the world
     * @param {SpellSpawner} spawner
     */
    addSpellSpawner(spawner){
        spawner.addEventListener("delete", (event) => {
            this.spawners.spells = this.spawners.spells.filter((spawner) => spawner !== event.detail.model);
        });
        this.spawners.spells.push(spawner);
    }

    /**
     * Clear all minion spawners
     */
    clearMinionSpawners(){
        this.spawners.minions.forEach((spawner) => spawner.dispose());
        this.spawners.minions = [];
    }

    /**
     * Clear all spell spawners
     */
    clearSpellSpawners(){
        this.spawners.spells.forEach((spawner) => spawner.dispose());
        this.spawners.spells = [];
    }

    /**
     * Get island by position
     * @param position - position in world coordinates
     * @returns {*|null} - the island at the position or null if there is no island at the position
     */
    getIslandByPosition(position){
        for(const island of this.islands){
            if(position.x > island.min.x - gridCellSize/2 &&
                position.x < island.max.x + gridCellSize/2 &&
                position.z > island.min.z - gridCellSize/2 &&
                position.z < island.max.z + gridCellSize/2){
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
     * @param {THREE.Vector3} position - needs to be in world-grid coordinates (=world coordinates rounded to grid cell size)
     * @param {Number} rotation - 0, 90, 180, 270
     * @param {Boolean} withTimer
     * @return {Building || null} - the building that was added to the world
     */
    addBuilding(buildingName, position, rotation = 0, withTimer = false){
        const island = this.getIslandByPosition(position);
        if(island.team !== this.player.team){
            console.error("cannot add building to enemy island");
            return null;
        }
        //buildTypes.getNumber("empty") is more readable than 1
        if(island?.checkCell(position) === buildTypes.getNumber("empty")){
            convertWorldToGridPosition(position.sub(island.position));
            const building = this.factory.createBuilding({
                buildingName: buildingName,
                position: position,
                rotation: rotation,
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
     * Update the world and all its components
     * @param deltaTime
     */
    update(deltaTime){
        //update whole model
        for(const spawnerType in this.spawners){
            this.spawners[spawnerType].forEach((spawner) => {
                spawner.update(deltaTime);
            });
        }
        this.collisionDetector.checkSpellEntityCollisions(deltaTime);
        this.collisionDetector.checkCharacterCollisions(deltaTime);
        this.spellFactory.models = this.spellFactory.models.filter((model) => model.timer <= model.duration);
        this.spellFactory.models.forEach((model) => model.update(deltaTime));
    }
}