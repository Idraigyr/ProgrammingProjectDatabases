import {Model} from "../Model/Model";
import {Controller} from "./Controller";
import {API_URL} from "../../js/config";


export class WorldManager {
    constructor(factory) {
        this.world = null;
        this.factory = factory;
    }

    async importWorld(url,request){

        /*
        try {
            // GET request to server
            const response = await $.getJSON(url,request);
            //parse json into World-Object
            this.world = JSON.parse(response);
            if(!response.done()){
                throw Error(`${response.statusText} (${response.status})`);
            }
        } catch (e){
            console.log(e);
        }
        */
        let islands = null;
        let player = null;
        let characters = null;
        this.world = new Model.World({islands: islands, player: player, characters: characters, Factory: this.factory});
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