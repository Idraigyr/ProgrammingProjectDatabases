import {Model} from "../Model/Model.js";
import {API_URL, islandURI} from "../configs/EndpointConfigs.js";
import {playerSpawn} from "../configs/ControllerConfigs.js";


/**
 * Class that manages the world
 */
export class WorldManager {
    constructor(params) {
        this.world = null;
        this.factory = params.factory;
        this.spellFactory = params.spellFactory;
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
                },
                    {
                    type: "Altar",
                    position: { //TODO: this should be gridSquare coordinates
                        x: 0,
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
            }
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

        this.world = new Model.World({islands: islands, player: player, characters: characters, Factory: this.factory, SpellFactory: this.spellFactory});
    }

    placeBuilding(event){
        const buildingName = event.detail.buildingName;
        const position = event.detail.position;

        this.world.addBuilding(buildingName, position, event.detail.withTimer);
    }

    async exportWorld(){

    }

    async sendPOST(){

    }

    async updateGems(){

    }

    async updateBuildings(){

    }

    async updateCharacter(){

    }

}