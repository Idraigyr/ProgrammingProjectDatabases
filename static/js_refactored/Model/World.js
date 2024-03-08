import {Factory} from "../Controller/Factory.js";

export class World{
    constructor(params) {
        this.factory = params.Factory;
        this.islands = [];
        params.islands.forEach((island) => {
            this.islands.push(this.factory.createIsland(island.position,island.rotation, island.buildings));
        });
        this.player = this.factory.createPlayer();
        this.characters = [];
    }
    exportWorld(json){

    }

    importWorld(json){

    }
    update(deltaTime){

    }
}