import {Model} from "../Model/Model.js";
import {API_URL, islandURI} from "../configs/EndpointConfigs.js";
import {playerSpawn} from "../configs/ControllerConfigs.js";


/**
 * Class that manages the world
 */
export class WorldManager {
    constructor(params) {
        this.world = null;
        this.userInfo = params.userInfo;
        this.factory = params.factory;
        this.spellFactory = params.spellFactory;
    }

    async importWorld(islandID){
        let islands = [
            {buildings: [{
                    type: "Mine",
                    position: { //TODO: this should be gridSquare coordinates
                        x: 5,
                        y: 0,
                        z: 5
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

    async exportWorld(){

    }

    /**
     * changes to resources of the player, when event removes crystals, crystals should always be the first key
     * @param event
     */
    updatePlayerStats(event){
        console.log(event);
        for(const key of event.detail.type){
            console.log(key);
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

    async sendPOST(){

    }

    async updateGems(){

    }

    async updateBuildings(){

    }

    async updateCharacter(){

    }

}