import {Character} from "./Character";
import {Factory} from "../Controller/Factory";

export class World{
    constructor(params) {
        this.factory = params.Factory;
        this.islands = this.factory.createIsland();
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