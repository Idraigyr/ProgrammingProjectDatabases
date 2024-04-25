import {Model} from "../Model/ModelNamespace.js";
import {API_URL, islandURI, placeableURI, postRetries} from "../configs/EndpointConfigs.js";
import {playerSpawn} from "../configs/ControllerConfigs.js";
import {assert, convertGridIndexToWorldPosition, convertWorldToGridPosition} from "../helpers.js";
import {MinionSpawner} from "../Model/Spawners/MinionSpawner.js";
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
        this.currentRotation = 0;

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
                    rotation: building.rotation*90,
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

    /**
     * Calculates a random offset for the next island to be placed (currently only works for adding 1 island around 0,0,0)
     * DO NOT USE FOR MULTIPLAYER! there is currently no information exchange between players about the position of the islands
     * will almost always be used together with calculateBridgeMetrics so check that method for more information
     * will always return an even number for x and z
     * @param {number} maxDistance
     * @param {number} minDistance
     * @return {THREE.Vector3}
     */
    calculateRandomIslandOffset(minDistance = 15, maxDistance = 20){
        let x = Math.floor(Math.random() * (maxDistance - minDistance) + minDistance);
        let z = Math.floor(Math.random() * (maxDistance - minDistance) + minDistance);
        if(x % 2 !== 0) {
            if(x <= minDistance) x++;
            else x--;
        }
        if(z % 2 !== 0) {
            if(z <= minDistance) z++;
            else z--;
        }
        return new THREE.Vector3(x*gridCellSize, 0, z*gridCellSize);
    }

    /**
     * Calculates an offset for the next island to be placed (currently only works for adding 1 island around 0,0,0)
     * @return {THREE.Vector3}
     */
    calculateIslandOffset(){
        return new THREE.Vector3((15+3)*gridCellSize, 0, 0);
    }

    /**
     * calculates the position, width, and length of a bridge between two islands, positions of islands must be even, width and length of islands must be odd
     * @param {Foundation} island1
     * @param {Foundation} island2
     * @param {number} padding - the number of grid cells to add to the bridge (only on the sides of the bridge, not the ends)
     * @return {{width: number, length: number, position: THREE.Vector3}}
     */
    calculateBridgeMetrics(island1, island2, padding= 1){ //TODO: refactor/optimise this harrowing method
        assert(island1.width % 2 === 1 && island1.length % 2 === 1, "island1 width and length must be odd");
        assert(island2.width % 2 === 1 && island2.length % 2 === 1, "island2 width and length must be odd");
        assert(island1.position.x%2 === 0 && island1.position.z%2 === 0, "island1 position must be even");
        assert(island2.position.x%2 === 0 && island2.position.z%2 === 0, "island2 position must be even");

        const bridgePosition = convertWorldToGridPosition(island1.position.clone().add(island2.position).divideScalar(2));

        const xEdgeDiff = island1.position.x > island2.position.x ? island1.min.x - island2.max.x : island2.min.x - island1.max.x;
        const zEdgeDiff = island1.position.z > island2.position.z ? island1.min.z - island2.max.z : island2.min.z - island1.max.z;

        console.log("xEdgeDiff", xEdgeDiff);
        console.log("zEdgeDiff", zEdgeDiff);
        if(xEdgeDiff <= gridCellSize && zEdgeDiff <= gridCellSize){
           throw new Error("islands are too close to each other");
        }

        const xDiff = island1.position.x - island2.position.x;
        const zDiff = island1.position.z - island2.position.z;

        let bridgeMinX, bridgeMaxX, bridgeMinZ, bridgeMaxZ;
        if(zDiff >= 0 && zEdgeDiff > 0 && (xEdgeDiff <= 0 || xEdgeDiff >= zEdgeDiff)){ //island2 is north of island1 + edge cases
            if(xDiff >= 0){ // island2 is north of island1 and west/center of island1
                bridgeMinX = island2.position.x - padding*gridCellSize;
                bridgeMaxX = island1.position.x + padding*gridCellSize;
            } else { // island2 is north of island1 and east of island1
                bridgeMinX = island1.position.x - padding*gridCellSize;
                bridgeMaxX = island2.position.x + padding*gridCellSize;
            }
            bridgeMinZ = island2.max.z + gridCellSize;
            bridgeMaxZ = island1.min.z - gridCellSize;
        } else if(xDiff < 0 && xEdgeDiff > 0 && (zEdgeDiff <= 0 || zEdgeDiff >= xEdgeDiff)){ //island2 is east of island1 + edge cases
            bridgeMinX = island1.max.x + gridCellSize;
            bridgeMaxX = island2.min.x - gridCellSize;
            if(zDiff >= 0){ // island2 is east of island1 and north/center of island1
                bridgeMinZ = island2.position.z - padding*gridCellSize;
                bridgeMaxZ = island1.position.z + padding*gridCellSize;
            } else { // island2 is east of island1 and south of island1
                bridgeMinZ = island1.position.z - padding*gridCellSize;
                bridgeMaxZ = island2.position.z + padding*gridCellSize;
            }
        } else if(zDiff < 0 && zEdgeDiff > 0 && (xEdgeDiff <= 0 || xEdgeDiff >= zEdgeDiff)){ //island2 is south of island1 + edge cases
            if(xDiff >= 0){ // island2 is south of island1 and west/center of island1
                bridgeMinX = island2.position.x - padding*gridCellSize;
                bridgeMaxX = island1.position.x + padding*gridCellSize;
            } else { // island2 is south of island1 and east of island1
                bridgeMinX = island1.position.x - padding*gridCellSize;
                bridgeMaxX = island2.position.x + padding*gridCellSize;
            }
            bridgeMinZ = island1.max.z + gridCellSize;
            bridgeMaxZ = island2.min.z - gridCellSize;
        } else if(xDiff > 0){ //island2 is west of island1 + edge cases
            bridgeMinX = island2.max.x + gridCellSize;
            bridgeMaxX = island1.min.x - gridCellSize;
            if(zDiff >= 0){ // island2 is west of island1 and north/center of island1
                bridgeMinZ = island2.position.z - padding*gridCellSize;
                bridgeMaxZ = island1.position.z + padding*gridCellSize;
            } else { // island2 is west of island1 and south of island1
                bridgeMinZ = island1.position.z - padding*gridCellSize;
                bridgeMaxZ = island2.position.z + padding*gridCellSize;
            }
        } else {
            throw new Error("no known bridge formation for current island positions");
        }

        return {position: bridgePosition, width: (bridgeMaxX - bridgeMinX)/gridCellSize + 1, length: (bridgeMaxZ - bridgeMinZ)/gridCellSize + 1};
    }

    addOpponent(params){
        const opponent = this.factory.createPlayer(params);
        this.world.addEntity(opponent);
        return opponent;
    }

    async addImportedIslandToWorld(islandID, currentIslandIsCenter = true){
        const {island, characters} = await this.importIsland(islandID);
        let islandPosition = new THREE.Vector3(0,0,0);
        const offset = this.calculateIslandOffset();
        console.log("offset", offset);
        if(currentIslandIsCenter){
            islandPosition.add(offset);
            //TODO: implement rotation in factory createIsland
            this.world.addIsland(this.factory.createIsland({position: islandPosition, rotation: 180, buildingsList: island.buildings, width: 15, length: 15, team: 1})); //TODO: team should be dynamically allocated
        } else {
            const offset = this.calculateIslandOffset(this.world.islands[0].width, this.world.islands[0].length);
            //TODO: make sure these 2 lines work correctly
            this.world.islands[0].position = this.world.islands[0].position.add(offset);
            this.world.player.position = this.world.player.position.add(offset);
            this.world.player.spawnPoint = this.world.player.spawnPoint.add(offset);
            console.log("I moved myself with the island", this.world.player.position);
            this.world.islands[0].rotation = 180;
            this.world.addIsland(this.factory.createIsland({position: islandPosition, rotation: island.rotation, buildingsList: island.buildings, width: 15, length: 15, team: 1}));
        }
        const {position, width, length} = this.calculateBridgeMetrics(this.world.islands[0], this.world.islands[1]);
        //add a bridge between the 2 islands
        this.world.addIsland(this.factory.createBridge({position: position, rotation: 0, width: width, length: length}));

        this.collisionDetector.generateColliderOnWorker();
        // this.collisionDetector.visualize({bvh: true});
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
            health: this.userInfo.health,
            maxHealth: this.userInfo.maxHealth,
            mana: this.userInfo.mana,
            maxMana: this.userInfo.maxMana,
        };

        this.factory.currentTime = new Date(await this.userInfo.getCurrentTime());
        this.world = new Model.World({factory: this.factory, SpellFactory: this.spellFactory, collisionDetector: this.collisionDetector});
        this.world.addIsland(this.factory.createIsland({position: island.position, rotation: island.rotation, buildingsList: island.buildings, width: 15, length: 15}));
        this.world.setPlayer(this.factory.createPlayer(player));
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
        const buildingName = event.detail.buildingName;
        if(!this.userInfo.unlockedBuildings.includes(buildingName) || this.userInfo.buildingsPlaced > this.userInfo.maxBuildings){
            console.log("cant place building you have not unlocked or you have reached the max number of buildings");
            console.log("unlocked buildings", this.userInfo.unlockedBuildings);
            console.log("building name", buildingName);
            console.log("buildings placed", this.userInfo.buildingsPlaced);
            console.log("max buildings", this.userInfo.maxBuildings);
        }
        if(this.userInfo.unlockedBuildings.includes(buildingName) && this.userInfo.buildingsPlaced < this.userInfo.maxBuildings){
            const placeable = this.world.addBuilding(buildingName, event.detail.position, event.detail.rotation, event.detail.withTimer);
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
     * places minionSpawners on warrior huts and attaches event listeners to them. The event listeners add the minions to the world and attach their controller
     * @param {MinionController} controller
     */
    generateMinionSpawners(controller){ //TODO: refactor this method: try to remove arrow function
        this.world.islands.forEach((island) => {
            if(!(island instanceof Model.Island) || island.team !== this.world.player.team) return;
            const warriorHuts = island.getBuildingsByType("warrior_hut");
            warriorHuts.forEach((hut) => {
                const spawner = new MinionSpawner({position: hut.position, buildingID: hut.id, interval: 4, maxSpawn: 6});
                spawner.addEventListener("spawn", (event) => {
                   controller.addMinion(this.factory.createMinion(event.detail));
                });
                this.world.addMinionSpawner(spawner);

            });
        });
    }

    clearMinionSpawners(){
        this.world.clearMinionSpawners();
    }

    /**
     * Adds a new island to the world to spawn minions (single player only)
     */
    addSpawningIsland(){
        //TODO: get a random position for the island which lies outside of the main island
        let position = {x: -9, y: 0, z: -8};
        convertGridIndexToWorldPosition(position)
        //TODO: if the new island is not connected to the main island, add a bridge that connects the two islands

        //create an island
        let island = this.factory.createIsland({position: new THREE.Vector3(position.x, 0, position.z), rotation: 0, buildingsList: [], width: 3, length: 3, team: 1});
        // //create a bridge
        // let bridge = this.factory.createBridge({position: {x: 0, y: 0, z: 0}, rotation: 0});

        //add the bridge and island to the world
        this.world.islands.push(island);
        // this.world.islands.push(bridge);

        //add a enemy warrior hut to the island
        let hut = this.factory.createBuilding({buildingName: "WarriorHut", position: position, withTimer: false, id: 999});
        island.addBuilding(hut);
        // this.world.addBuilding("Tower", convertGridIndexToWorldPosition(new THREE.Vector3(position.x, 0, position.z)), false);
        this.world.addMinionSpawner(new MinionSpawner({position: new THREE.Vector3(position.x, 15, position.z), buildingID: hut.id, interval: 4}));
        this.collisionDetector.generateColliderOnWorker();
    }

    /**
     * Collects the crystals from the building at the current position
     * @returns {Promise<void>} - a promise that resolves when the crystals have been collected
     */
    async collectCrystals(){
        const building = this.world.getBuildingByPosition(this.currentPos);
        console.log("collect from mine - worldManager", building);
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
            console.log("sending POST request: ", entity);
            const island = this.world.getIslandByPosition(entity.position);
            if(!island){ //TODO: add team check/ check if island is player's
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
        if(!island){ //TODO: add team check / check if island = player's
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