import {Model} from "../Model/ModelNamespace.js";
import {API_URL, islandURI, placeableURI, postRetries, taskURI, timeURI} from "../configs/EndpointConfigs.js";
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
        this.playerInfo = params.playerInfo;
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
                    id: building.placeable_id,
                    gems: building.gems,
                    task: building.task
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

    /**
     * Adds an enemy player to the world
     * @param params
     * @return {Wizard}
     */
    addOpponent(params){
        if(params.team === this.world.player.team) throw new Error("cannot add opponent with same team as player");
        const opponent = this.factory.createOpponent(params);
        this.world.addEntity(opponent);
        return opponent;
    }

    async addImportedIslandToWorld(islandID, currentIslandIsCenter = true){
        const {island, characters} = await this.importIsland(islandID);
        let islandPosition = new THREE.Vector3(0,0,0);
        const offset = this.calculateIslandOffset();
        const rotation = 180;
        console.log("offset", offset);
        if(currentIslandIsCenter){
            islandPosition.add(offset);
            //TODO: implement rotation in factory createIsland
            this.world.addIsland(this.factory.createIsland({position: islandPosition, rotation: rotation, buildingsList: island.buildings, width: 15, length: 15, team: 1})); //TODO: team should be dynamically allocated
        } else {
            const offset = this.calculateIslandOffset(this.world.islands[0].width, this.world.islands[0].length);
            this.moveCurrentIsland(offset, rotation);
            this.world.addIsland(this.factory.createIsland({position: islandPosition, rotation: island.rotation, buildingsList: island.buildings, width: 15, length: 15, team: 1}));
        }
        const {position, width, length} = this.calculateBridgeMetrics(this.world.islands[0], this.world.islands[1]);
        //add a bridge between the 2 islands
        this.world.addIsland(this.factory.createBridge({position: position, rotation: 0, width: width, length: length, team: 3}));

        this.collisionDetector.generateColliderOnWorker();
    }

    /**
     * Moves the current island and player to the new position, BE AWARE: this method does not call generateColliderOnWorker
     * @param {THREE.Vector3} translation - the translation to apply to the island
     * @param {number} rotation - the new rotation of the island in degrees
     */
    moveCurrentIsland(translation, rotation){
        const island = this.world.islands[0];
        island.position = island.position.add(translation);
        island.rotation = rotation;
        //TODO: make sure these 2 lines work correctly
        console.log("I moved myself with the island", this.world.player.position);
        this.world.player.spawnPoint = this.world.player.spawnPoint.add(translation);
        this.world.player.position = this.world.player.spawnPoint;
    }

    /**
     * resets the world state, removing all entities of other teams, removing spawners
     * @param {number} team
     */
    resetWorldState(){
        this.clearSpawners();
        this.world.removeEntitiesByTeam(1);
        this.moveCurrentIsland(this.calculateIslandOffset().negate(), -180);
        this.collisionDetector.generateColliderOnWorker();
    }


    /**
     * Imports an island from the server and generates a player
     * @param islandID - the id of the island to import
     * @returns {Promise<void>} - a promise that resolves when the world has been imported
     */
    async importWorld(islandID){
        const {island, characters} = await this.importIsland(islandID);
        let playerPosition;
        if(this.playerInfo.playerPosition) {
            playerPosition = this.playerInfo.playerPosition;
        }else{
            playerPosition = {x: playerSpawn.x, y: playerSpawn.y, z: playerSpawn.z};
        }
        console.log("Player position from database: ", playerPosition);
        const player = {position: {
                x: playerPosition.x,
                y: playerPosition.y,
                z: playerPosition.z
            },
            health: this.playerInfo.health,
            maxHealth: this.playerInfo.maxHealth,
            mana: this.playerInfo.mana,
            maxMana: this.playerInfo.maxMana,
        };

        this.factory.currentTime = new Date(await this.playerInfo.getCurrentTime());
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
        this.deleteOldTasks(); // TODO: or somewhere else?
    }

    async deleteOldTasks(){
        // Get all tasks from the server
        $.getJSON(`${API_URL}/${taskURI}/list?island_id=${this.playerInfo.islandID}&is_over=true`).done((data) => {
            // Delete all tasks that are finished
            data.forEach((task) => {
                $.ajax({
                    url: `${API_URL}/${taskURI}?id=${task.id}`,
                    type: "DELETE",
                    error: (e) => {
                        console.error(e);
                    }
                }).done((data, textStatus, jqXHR) => {
                    console.log("DELETE success");
                    console.log(textStatus, data);
                }).fail((jqXHR, textStatus, errorThrown) => {
                    console.log("DELETE fail");
                    console.error(textStatus, errorThrown);
                });
            });
        }).fail((jqXHR, textStatus, errorThrown) => {
            console.error("GET request failed");
            console.error(textStatus, errorThrown);
        });
    }

    /**
     * Places a building in the world
     * @param {{detail: {position: THREE.Vector3, withTimer: Boolean}}} event - position needs to be in world/grid coordinates
     */
    placeBuilding(event){
        const buildingName = event.detail.buildingName;
        if(!this.playerInfo.unlockedBuildings.includes(buildingName) || this.playerInfo.buildingsPlaced > this.playerInfo.maxBuildings){
            console.log("cant place building you have not unlocked or you have reached the max number of buildings");
            console.log("unlocked buildings", this.playerInfo.unlockedBuildings);
            console.log("building name", buildingName);
            console.log("buildings placed", this.playerInfo.buildingsPlaced);
            console.log("max buildings", this.playerInfo.maxBuildings);
        }
        if(this.playerInfo.unlockedBuildings.includes(buildingName) && this.playerInfo.buildingsPlaced < this.playerInfo.maxBuildings){
            const placeable = this.world.addBuilding(buildingName, event.detail.position, event.detail.rotation, event.detail.withTimer);
            if(placeable){
                if(this.persistent){
                    this.sendPOST(placeableURI, placeable, postRetries, this.insertPendingPostRequest(placeable), event.detail.withTimer);
                }
                this.collisionDetector.generateColliderOnWorker();
                this.playerInfo.changeXP(10);
                this.playerInfo.buildingsPlaced++;
            } else {
                console.error("failed to add new building at that position");
            }

        }
    }
    async postBuildingTimer(uri, timeInSeconds, buildingID, islandId, retries){
        try {
            // Get server time
            let response = await this.playerInfo.getCurrentTime();
            let serverTime = new Date(response);
            serverTime.setSeconds(serverTime.getSeconds()+timeInSeconds);
            let timeZoneOffset = serverTime.getTimezoneOffset() * 60000;
            let localTime = new Date(serverTime.getTime() - timeZoneOffset);
            // Convert local time to ISO string
            let time = localTime.toISOString();
            let formattedDate = time.slice(0, 19);
            console.log(JSON.stringify({endtime: formattedDate, building_id: buildingID, island_id: islandId}));
            $.ajax({
                url: `${API_URL}/${uri}`,
                type: "POST",
                data: JSON.stringify({endtime: formattedDate, building_id: buildingID, island_id: islandId}),
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.error(e);
                }
            }).done((data, textStatus, jqXHR) => {
                console.log("POST success");
                console.log(textStatus, data);
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log("POST fail");
                if (retries > 0){
                    this.postBuildingTimer(uri, timeInSeconds, buildingID, islandId, retries - 1);
                } else {
                    throw new Error(`Could not send POST request for building: Error: ${textStatus} ${errorThrown}`);
                }
            });
        } catch (err){
            console.error(err);
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

    /**
     * Clears all spawners from the world
     */
    clearSpawners(){
        this.world.clearMinionSpawners();
        this.world.clearSpellSpawners();
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
            this.playerInfo.changeCrystals(building.takeStoredCrystals(new Date(await this.playerInfo.getCurrentTime())));
        } else {
            console.error("no building found at that position");
        }
    }

    async addCrystals(){
        console.log("added 10 crystals");
        this.playerInfo.changeCrystals(10);
    }

    async removeCrystals(){
        console.log("removed 10 crystals");
        this.playerInfo.changeCrystals(-10);
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
                if(!this.playerInfo.changeCrystals(event.detail.params[key])){
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
                this.playerInfo.changeXP(event.detail.params[key]);
            } else if (key === "level"){
                this.playerInfo.changeLevel(event.detail.params[key]);
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
     * @param {Number} requestIndex - the index of the Entity in the postRequests array (used to remove the request from the array) use insertPendingPostRequest to get the index
     * @returns {Promise<void>}
     */
    sendPOST(uri, entity, retries, requestIndex, withTimer = false){
        try {
            console.log("sending POST request: ", entity);
            const island = this.world.getIslandByPosition(entity.position);
            if(!island){ //TODO: add team check/ check if island is player's
                throw new Error("No island found at position");
            }
            $.ajax({
                url: `${API_URL}/${uri}/${entity.dbType}`,
                type: "POST",
                data: JSON.stringify(entity.formatPOSTData(this.playerInfo, island.position)),
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
                if (withTimer){
                    this.postBuildingTimer(taskURI, entity.timeToBuild, entity.id, this.playerInfo.islandID, postRetries);
                }
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log("POST fail");
                if (retries > 0){
                    this.sendPOST(uri, entity, retries - 1, requestIndex, withTimer);
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
    sendPUT(uri, entity, retries){ //TODO: add to postRequests array
        const island = this.world.getIslandByPosition(entity.position);
        if(!island){ //TODO: add team check / check if island = player's
            throw new Error("No island found at position");
        }
        try {
            $.ajax({
                url: `${API_URL}/${uri}/${entity.dbType}`,
                type: "PUT",
                data: JSON.stringify(entity.formatPUTData(this.playerInfo, island.position)),
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