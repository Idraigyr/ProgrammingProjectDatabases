import {Controller} from "./Controller.js";
import {Model} from "../Model/Model.js";
import {View} from "../View/ViewNamespace.js";
import {Fireball} from "../Model/Spell.js";

export class SpellFactory{
    constructor(scene) {
        this.scene = scene;
        this.AssetLoader = new Controller.AssetLoader(this.scene);
        this.views = [];
        this.models = [];
    }
    createSpell(event){
        let entityModel = null;
        switch (event.detail.type.constructor){
            case Fireball:
                entityModel = this._createFireball(event.detail);
                break;
            case 2:
                break;
        }
        this.models.push(entityModel);
    }

    _createFireball(details){
        let model = new Model.Projectile({
            spellType: details.type,
            direction: details.params.direction,
            velocity: details.type.spell.velocity,
            fallOf: details.type.fallOf,
            position: details.params.position
        });
        let view = new View.Fireball();
        view.initModel(); //TODO: implement particle system instead of sphere
        this.scene.add(view.charModel);
        model.addEventListener("updatePosition", view.updatePosition.bind(view));
        this.views.push(view);
        return model;
    }
}