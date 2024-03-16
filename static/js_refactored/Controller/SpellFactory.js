import {Controller} from "./Controller.js";
import {Model} from "../Model/Model.js";
import {View} from "../View/ViewNamespace.js";
import {Fireball, BuildSpell} from "../Model/Spell.js";
import {Building} from "../View/BuildingView.js";

export class SpellFactory{
    constructor(params) {
        this.scene = params.scene;
        this.camera = params.camera;
        this.viewManager = params.viewManager;
        this.AssetLoader = new Controller.AssetLoader(this.scene);
        this.assetManager = params.assetManager;
        //TODO: change this
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
        return entityModel;
    }

    _createFireball(details){
        let model = new Model.Projectile({
            spellType: details.type,
            direction: details.params.direction,
            velocity: details.type.spell.velocity,
            fallOf: details.type.fallOf,
            position: details.params.position
        });
        let uniforms = {
            diffuseTexture: {
                value: this.assetManager.getAsset("fire")
            },
            pointMultiplier: {
                value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
            }
        };
        let view = new View.Fireball({
            scene: this.scene,
            camera: this.camera,
            position: details.params.position,
            uniforms: uniforms
        });

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
        view.charModel = this.assetManager.getAsset("Tree");

        this.scene.add(view.charModel);
        model.addEventListener("updatePosition", view.updatePosition.bind(view));
        this.viewManager.addPair(model,view);
        return model;
    }
}