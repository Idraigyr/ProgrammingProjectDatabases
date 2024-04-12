import {Model} from "../Model/Model.js";
import {API_URL, islandURI, placeableURI, postRetries} from "../configs/EndpointConfigs.js";
import {playerSpawn} from "../configs/ControllerConfigs.js";
import {convertWorldToGridPosition} from "../helpers.js";


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

    async importWorld(islandID){
        let islands = [
            {buildings: [],
                position: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                rotation: 0
            }
        ];
        let player = {position: {
                x: playerSpawn.x,
                y: playerSpawn.y,
                z: playerSpawn.z
            },
            health: 100,
            mana: 1000,
            maxMana: 1000
        };
        let characters = [];

        try {
            // GET request to server
            const response = await $.getJSON(`${API_URL}/${islandURI}?id=${islandID}`);
            for(const building of response.placeables){
                islands[0].buildings.push({
                    type: building.blueprint.name,
                    position: {
                        x: building.x,
                        y: 0,
                        z: building.z
                    },
                    rotation: 0,
                    id: building.placeable_id
                });
            }

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
            console.log(e);
        }

        this.world = new Model.World({islands: islands, player: player, characters: characters, factory: this.factory, SpellFactory: this.spellFactory, collisionDetector: this.collisionDetector});
    }

    /**
     * Places a building in the world
     * @param {{detail: {position: THREE.Vector3, withTimer: Boolean}}} event - position needs to be in world/grid coordinates
     */
    placeBuilding(event){
        const buildingName = event.detail.buildingName;
        const placeable = this.world.addBuilding(buildingName, event.detail.position, event.detail.withTimer);
        if(placeable){
            const requestIndex = this.postRequests.length;
            if(this.persistent){
                this.sendPOST(placeableURI, placeable, postRetries, requestIndex);
            }
            this.collisionDetector.generateColliderOnWorker();
        } else {
            console.log("failed to add new building at that position");
        }
    }

    checkPosForBuilding(worldPosition){
        return this.world.checkPosForBuilding(worldPosition);
    }


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
                this.userInfo.changeLevel();
            }
            //TODO: sad sound when not enough crystals
            //TODO: update db?
        }
    }

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
            $.ajax({
                url: `${API_URL}/${uri}/${entity.dbType}`,
                type: "POST",
                data: JSON.stringify(entity.formatPOSTData(this.userInfo)),
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.log(e);
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
            console.log(err);
        }
    }

    async updateGems(){

    }

    async updateBuildings(){

    }

    async updateCharacter(){

    }

}