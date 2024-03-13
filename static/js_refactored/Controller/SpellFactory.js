import {Controller} from "./Controller.js";
import {Model} from "../Model/Model.js";
import {View} from "../View/ViewNamespace.js";
import {Fireball, BuildSpell} from "../Model/Spell.js";
import {Building} from "../View/BuildingView.js";

export class SpellFactory{
    constructor(params) {
        this.scene = params.scene;
        this.viewManager = params.viewManager;
        this.AssetLoader = new Controller.AssetLoader(this.scene);
        this.AssetManager = params.assetManager;
        this.models = [];
    }
    createSpell(event){
        let entityModel = null;
        switch (event.detail.type.constructor){
            case Fireball:
                entityModel = this._createFireball(event.detail);
                break;
            case BuildSpell:
                // TODO: change this
                entityModel = this._createTree(event.detail);
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
        this.viewManager.addPair(model,view);
        return model;
    }
    _createTree(details){
        let model = new Model.Projectile({
            spellType: details.type,
            direction: details.params.direction,
            velocity: details.type.spell.velocity,
            fallOf: details.type.fallOf,
            position: details.params.position
        });
        let view = new Building();
        view.charModel = this.AssetManager.getModel("tree");

        this.scene.add(view.charModel);
        model.addEventListener("updatePosition", view.updatePosition.bind(view));
        this.viewManager.addPair(model,view);
        return model;
    }
}