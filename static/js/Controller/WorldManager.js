import {Model} from "../Model/Model.js";
import {API_URL, islandURI, placeableURI, postRetries} from "../configs/EndpointConfigs.js";
import {playerSpawn} from "../configs/ControllerConfigs.js";


/**
 * Class that manages the world
 */
export class WorldManager{
    constructor(params) {
        this.world = null;
        this.factory = params.factory;
        this.spellFactory = params.spellFactory;
        this.collisionDetector = params.collisionDetector;
        this.userInfo = params.userInfo;

        this.postRequests = [];

        document.addEventListener('placeBuilding', this.placeBuilding.bind(this));
    }

    async importWorld(islandID){
        let islands = [
            {buildings: [{
                    type: "Mine",
                    position: { //TODO: this should be gridSquare coordinates
                        x: 2,
                        y: 0,
                        z: 1
                    },
                    rotation: 0
                }
                ],
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

    placeBuilding(event){
        const buildingName = event.detail.buildingName;
        const position = event.detail.position;
        const placeable = this.world.addBuilding(buildingName, position);
        const requestIndex = this.postRequests.length;
        this.sendPOST(placeableURI, placeable, 3, requestIndex);
        this.collisionDetector.generateColliderOnWorker();

    }


    async exportWorld(){

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
        console.log("sending POST");
        console.log(entity.formatPOSTData(this.userInfo));
        $.post(`${API_URL}/${uri}/${entity.dbType}`, entity.formatPOSTData(this.userInfo)).done((data, textStatus, jqXHR) => {
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
    }

    async updateGems(){

    }

    async updateBuildings(){

    }

    async updateCharacter(){

    }

}