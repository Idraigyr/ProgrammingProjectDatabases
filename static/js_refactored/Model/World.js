import {Factory} from "../Controller/Factory.js";
import {Fireball, BuildSpell} from "./Spell.js";

export class World{
    constructor(params) {
        this.factory = params.Factory;
        this.spellFactory = params.SpellFactory;
        this.islands = [];
        params.islands.forEach((island) => {
            this.islands.push(this.factory.createIsland(island.position,island.rotation, island.buildings));
        });
        this.player = this.factory.createPlayer();
        this.player.changeEquippedSpell(0,new BuildSpell({position: null}));
        this.player.changeEquippedSpell(1,new Fireball({position: null}));
        this.entities = [];
        this.spellEntities = [];
    }
    exportWorld(json){

    }

    importWorld(json){

    }
    update(deltaTime){
        //update whole model
        this.spellFactory.models.forEach((model) => model.update(deltaTime));
    }
}