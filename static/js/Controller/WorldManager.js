import {Model} from "../Model/ModelNamespace.js";
import {API_URL, islandURI, placeableURI, postRetries} from "../configs/EndpointConfigs.js";
import {playerSpawn} from "../configs/ControllerConfigs.js";
import {convertGridIndexToWorldPosition} from "../helpers.js";
import {MinionSpawner} from "../Model/MinionSpawner.js";
import * as THREE from "three";
import {Fireball, BuildSpell, ThunderCloud, Shield, IceWall} from "../Model/Spell.js";
import {gridCellSize} from "../configs/ViewConfigs.js";


/**
 * Class that manages the world
 */
export class WorldManager{
    constructor(params) {
        this.world = null;
        this.userInfo = params.userInfo;
        this.factory = params.factory;
        this.spellFactory = params.spellFactory;
        this.collisionDetector = params.collisionDetector;
        this.currentPos = null;

        this.postRequests = [];

        document.addEventListener('placeBuilding', this.placeBuilding.bind(this));

        this.persistent = true;
    }

    async importIsland(islandID){
        let island = {
            buildings: [],
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                rotation: 0
        };

        let characters = [];

        try {
            // GET request to server
            const response = await $.getJSON(`${API_URL}/${islandURI}?id=${islandID}`);
            for(const building of response.placeables){
                island.buildings.push({
                    type: building.blueprint.name,
                    position: new THREE.Vector3(building.x, 0, building.z),
                    rotation: 0,
                    id: building.placeable_id
                });
            }

            //Remove?
            for(const entity in response.entities){
                characters.push({
                    type: entity.type,
                    position: {
                        x: entity.x,
                        y: entity.y,
                        z: entity.z
                    }
                });
            }

        } catch (e){
            console.error(e);
        }

        return {island: island, characters: characters};
    }

    calculateIslandOffset(){
        return new THREE.Vector3(gridCellSize*(15+1), 0, 0); //TODO: replace 15 with island width and length (+3 for gap between islands)
    }

    addOpponent(params){
        const opponent = this.factory.createPlayer(params);
        this.world.addEntity(opponent);
        return opponent;
    }

    async addImportedIslandToWorld(islandID, currentIslandIsCenter = true){
        console.log("importing island");
        const {island, characters} = await this.importIsland(islandID);
        let islandPosition = new THREE.Vector3(0,0,0);
        if(currentIslandIsCenter){
            islandPosition.add(this.calculateIslandOffset());
            //TODO: implement rotation in factory createIsland
            this.world.addIsland(this.factory.createIsland({position: islandPosition, rotation: 180, buildingsList: island.buildings, width: 15, length: 15}));
        } else {
            //TODO: make sure these 2 lines work correctly
            this.world.islands[0].position = this.world.islands[0].position.add(this.calculateIslandOffset());
            this.world.islands[0].rotation = 180;
            this.world.addIsland(this.factory.createIsland({position: islandPosition, rotation: island.rotation, buildingsList: island.buildings, width: 15, length: 15}));
        }
        this.collisionDetector.generateColliderOnWorker();
        this.collisionDetector.visualize({bvh: true});
    }


    /**
     * Imports an island from the server and generates a player
     * @param islandID - the id of the island to import
     * @returns {Promise<void>} - a promise that resolves when the world has been imported
     */
    async importWorld(islandID){
        const {island, characters} = await this.importIsland(islandID);

        const player = {position: {
                x: playerSpawn.x,
                y: playerSpawn.y,
                z: playerSpawn.z
            },
            health: 100,
            mana: 1000,
            maxMana: 1000
        };

        this.factory.currentTime = new Date(await this.userInfo.getCurrentTime());
        this.world = new Model.World({factory: this.factory, SpellFactory: this.spellFactory, collisionDetector: this.collisionDetector});
        this.world.addIsland(this.factory.createIsland({position: island.position, rotation: island.rotation, buildingsList: island.buildings, width: 15, length: 15}));
        this.world.addPlayer(this.factory.createPlayer(player));
        // Set default values for the inventory slots
        // TODO @Flynn: Change this to use the Spell.js#concreteSpellFromId() factory function
        this.world.player.changeEquippedSpell(0,new BuildSpell({}));
        this.world.player.changeEquippedSpell(1,new Fireball({}));
        this.world.player.changeEquippedSpell(2,new ThunderCloud({}));
        this.world.player.changeEquippedSpell(3,new Shield({}));
        this.world.player.changeEquippedSpell(4,new IceWall({}));
        characters.forEach((characters) => {

        });
    }

    /**
     * Places a building in the world
     * @param {{detail: {position: THREE.Vector3, withTimer: Boolean}}} event - position needs to be in world/grid coordinates
     */
    placeBuilding(event){
        console.log("placeBuilding", event);
        const buildingName = event.detail.buildingName;
        if(!this.userInfo.unlockedBuildings.includes(buildingName) || this.userInfo.buildingsPlaced > this.userInfo.maxBuildings){
            console.log("cant place building you have not unlocked or you have reached the max number of buildings");
        }
        if(this.userInfo.unlockedBuildings.includes(buildingName) && this.userInfo.buildingsPlaced < this.userInfo.maxBuildings){
            const placeable = this.world.addBuilding(buildingName, event.detail.position, event.detail.withTimer);
            if(placeable){
                const requestIndex = this.postRequests.length;
                if(this.persistent){
                    this.sendPOST(placeableURI, placeable, postRetries, requestIndex);
                }
                this.collisionDetector.generateColliderOnWorker();
                this.userInfo.changeXP(10);
                this.userInfo.buildingsPlaced++;
            } else {
                console.error("failed to add new building at that position");
            }

        }
    }

    /**
     * Checks if a building can be placed at the given position
     * @param worldPosition - the position to check
     * @returns {*} - the building that is at that position or null if no building is there
     */
    checkPosForBuilding(worldPosition){
        return this.world.checkPosForBuilding(worldPosition);
    }

    /**
     * Adds a new island to the world to spawn minions
     */
    addSpawningIsland(){
        //TODO: get a random position for the island which lies outside of the main island
        let position = {x: -9, y: 0, z: -8};
        //TODO: if the new island is not connected to the main island, add a bridge that connects the two islands

        //create an island
        let island = this.factory.createIsland({position: convertGridIndexToWorldPosition(new THREE.Vector3(position.x, 0, position.z)), rotation: 0, buildingsList: [], width: 3, length: 3});
        // //create a bridge
        // let bridge = this.factory.createBridge({position: {x: 0, y: 0, z: 0}, rotation: 0});

        //add the bridge and island to the world
        this.world.islands.push(island);
        // this.world.islands.push(bridge);

        //add a enemy warrior hut to the island
        // let hut = this.factory.createBuilding({buildingName: "Tower", position: position, withTimer: false});
        // island.addBuilding(hut);
        // this.world.addBuilding("Tower", convertGridIndexToWorldPosition(new THREE.Vector3(position.x, 0, position.z)), false);
        this.world.spawners.push(new MinionSpawner({position: convertGridIndexToWorldPosition(new THREE.Vector3(position.x, 0, position.z))}));
        this.collisionDetector.generateColliderOnWorker();
    }

    /**
     * Collects the crystals from the building at the current position
     * @returns {Promise<void>} - a promise that resolves when the crystals have been collected
     */
    async collectCrystals(){
        const building = this.world.getBuildingByPosition(this.currentPos);
        console.log("collect from min - worldManager", building);
        if(building){
            this.userInfo.changeCrystals(building.takeStoredCrystals(new Date(await this.userInfo.getCurrentTime())));
        } else {
            console.error("no building found at that position");
        }
    }

    /**
     * Exports the world to the server
     * @returns {Promise<void>} - a promise that resolves when the world has been exported
     */
    async exportWorld(){

    }

    /**
     * changes to resources of the player, when event removes crystals, crystals should always be the first key
     * @param event
     */
    updatePlayerStats(event){
        for(const key of event.detail.type){
            if (key === "crystals"){
                if(!this.userInfo.changeCrystals(event.detail.params[key])){
                    break;
                }
            } else if(key === "health"){
                this.world.player.changeCurrentHealth(event.detail.params[key]);
            } else if(key === "mana"){
                this.world.player.changeCurrentMana(event.detail.params[key]);
            } else if(key === "maxHealth") {
                this.world.player.increaseMaxHealth(event.detail.params[key]);
            } else if(key === "maxMana") {
                this.world.player.increaseMaxMana(event.detail.params[key]);
            } else if (key === "xp"){
                this.userInfo.changeXP(event.detail.params[key]);
            } else if (key === "level"){
                this.userInfo.changeLevel(event.detail.params[key]);
            }
            //TODO: sad sound when not enough crystals
            //TODO: update db?
        }
    }

    /**
     * Add new post request to the postRequests array
     * @param placeable - the placeable to add to the postRequests array
     * @returns {number} - the index of the request in the postRequests array
     */
    insertPendingPostRequest(placeable){
        for (let i = 0; i < this.postRequests.length; i++){
            if(this.postRequests[i] === null){
                this.postRequests[i] = placeable;
                return i;
            }
        }
        this.postRequests.push(placeable);
        return this.postRequests.length - 1;
    }

    /**
     * Removes post request from the postRequests array
     * @param index - the index of the request in the postRequests array
     */
    removePendingPostRequest(index){
        this.postRequests[index] = null;
        while(this.postRequests[this.postRequests.length - 1] === null){
            this.postRequests.pop();
        }
    }



    /**
     * Send a POST request to the server
     * @param {String} uri - the URI to send the POST request to
     * @param {Entity} entity - the Entity that we want to add to the db
     * @param {Number} retries - the number of retries to resend the POST request
     * @param {Number} requestIndex - the index of the request in the postRequests array
     * @returns {Promise<void>}
     */
    sendPOST(uri, entity, retries, requestIndex){
        this.insertPendingPostRequest(entity);
        try {
            const island = this.world.getIslandByPosition(entity.position);
            if(!island){
                throw new Error("No island found at position");
            }
            $.ajax({
                url: `${API_URL}/${uri}/${entity.dbType}`,
                type: "POST",
                data: JSON.stringify(entity.formatPOSTData(this.userInfo, island.position)),
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.error(e);
                }
            }).done((data, textStatus, jqXHR) => {
                console.log("POST success");
                console.log(textStatus, data);
                entity.setId(data);
                this.removePendingPostRequest(requestIndex);
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log("POST fail");
                if (retries > 0){
                    this.sendPOST(uri, entity, retries - 1, requestIndex);
                } else {
                    throw new Error(`Could not send POST request for building: Error: ${textStatus} ${errorThrown}`);
                    //TODO: popup message to user that building could not be placed, bad connection? should POST acknowledgment be before or after model update?
                }
            });
        } catch (err){
            console.error(err);
        }
    }

    /**
     * Send a PUT request to the server
     * @param uri - the URI to send the PUT request to
     * @param entity - the Entity that we want to update in the db
     * @param retries - the number of retries to resend the PUT request
     */
    sendPUT(uri, entity, retries){
        const island = this.world.getIslandByPosition(entity.position);
        if(!island){
            throw new Error("No island found at position");
        }
        try {
            $.ajax({
                url: `${API_URL}/${uri}/${entity.dbType}`,
                type: "PUT",
                data: JSON.stringify(entity.formatPUTData(this.userInfo, island.position)),
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.error(e);
                }
            }).done((data, textStatus, jqXHR) => {
                console.log("PUT success");
                console.log(textStatus, data);
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log("PUT fail");
                if (retries > 0){
                    this.sendPUT(uri, entity, retries - 1);
                } else {
                    throw new Error(`Could not send PUT request for building: Error: ${textStatus} ${errorThrown}`);
                    }
            });
        } catch (err){
            console.error(err);
        }
    }

    async updateGems(){

    }

    async updateBuildings(){

    }

    async updateCharacter(){

    }

}