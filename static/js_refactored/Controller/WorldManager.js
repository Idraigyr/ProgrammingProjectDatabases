import {Model} from "../Model/Model.js";


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
        let islands = [
            {buildings: [{
                    type: "Altar",
                    position: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    rotation: 0
                },{
                    type: "Mine",
                    position: {
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
                x: 0,
                y: 0,
                z: 0
            }
        };
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