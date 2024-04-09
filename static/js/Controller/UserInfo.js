// import * as $ from "jquery"
import {playerSpawn} from "../configs/ControllerConfigs.js";
import {API_URL, playerURI} from "../configs/EndpointConfigs.js";
export class UserInfo{
    constructor() {
        this.userID = null;
        this.islandID = null;
        this.unclockedBuildings = [];
        this.gems = [];
        this.spells = [];

        this.crystals = 0;

        this.mana = 1000;
        this.health = 100;

        this.level = 0;
        this.experience = 0;

        this.playerPosition = {
            x: 0,
            y: 0,
            z: 0
        }
    }
    async retrieveInfo(){
        try {
            // GET request to server
            const response = await $.getJSON(`${API_URL}/${playerURI}`);

            this.userID = response.entity.player_id;
            this.islandID = response.entity.island_id;
            this.unclockedBuildings = response.blueprints;

            this.crystals = response.crystals;

            this.level = response.level;
            //TODO: wait for backend to implement this
            // this.experience = response.experience
            this.mana += this.calculateManaBonus();
            this.health += this.calculateHealthBonus();

            this.playerPosition.x = response?.entity?.x ?? playerSpawn.x;
            this.playerPosition.y = response?.entity?.y ?? playerSpawn.y;
            this.playerPosition.z = response?.entity?.z ?? playerSpawn.z;

        } catch (err){
            console.log(err);
        }
    }

    calculateHealthBonus(){
        return this.level*10;
    }

    calculateManaBonus(){
        return this.level*10;
    }
}