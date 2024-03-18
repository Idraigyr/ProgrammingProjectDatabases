import {Controller} from "./Controller.js";
import {Model} from "../Model/Model.js";
import {View} from "../View/ViewNamespace.js";
import {Fireball, BuildSpell, ThunderCloud} from "../Model/Spell.js";
import * as THREE from "three";

/**
 * Factory class that creates models and views for the spells
 */
export class SpellFactory{
    /**
     * Constructs the factory with the given parameters
     * @param params parameters (with scene, viewManager and AssetManager)
     */
    constructor(params) {
        this.scene = params.scene;
        this.camera = params.camera;
        this.viewManager = params.viewManager;
        this.AssetLoader = new Controller.AssetLoader(this.scene);
        this.assetManager = params.assetManager;
        //TODO: change this
        this.models = [];
    }

    /**
     * Creates spell for the given event
     * @param event event with spell details
     */
    createSpell(event){
        let entityModel = null;
        switch (event.detail.type.constructor){
            case Fireball:
                entityModel = this.#createFireball(event.detail);
                break;
            case ThunderCloud:
                entityModel = this.#createThunderCloud(event.detail);
                break;
            case BuildSpell:
                const customEvent = new CustomEvent('placeBuildSpell', { detail: {} });
                document.dispatchEvent(customEvent);
                break;
        }
        if(!entityModel) return;
        this.models.push(entityModel);
        return entityModel;
    }

    /**
     * Creates fireball model and view
     * @param details details of the fireball (with type and params)
     * @returns {Projectile} model of the fireball
     * @private private method
     */
    #createFireball(details){
        let model = new Model.Projectile({
            spellType: details.type,
            direction: details.params.direction,
            duration: details.type.spell.duration,
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
        model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
        this.viewManager.addPair(model,view);
        return model;
    }

    #createThunderCloud(details){
        let model = new Model.Immobile({
            spellType: details.type,
            position: details.params.position,
            duration: details.type.spell.duration
        });
        let position = new THREE.Vector3().copy(details.params.position);
        position.y += 15;
        let view = new View.ThunderCloud({
            camera: this.camera,
            texture: this.assetManager.getAsset("cloud"),
            position: position,
        });

        this.scene.add(view.charModel);
        model.addEventListener("updatePosition", view.updatePosition.bind(view));
        model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
        this.viewManager.addPair(model,view);
        console.log(model,view)
        return model;
    }




    /**
     * Creates building model and view for a tree
     * @returns {Tree} model of the tree
     */
    createTree(){
        let model = new Model.Tree();
        let view = new View.Tree({charModel: this.assetManager.getAsset("Tree")});
        this.scene.add(view.charModel);
        model.addEventListener("updatePosition", view.updatePosition.bind(view));
        model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
        this.viewManager.addPair(model,view);
        return model;
    }
}