import {Controller} from "./Controller.js";
import {Model} from "../Model/ModelNamespace.js";
import {View} from "../View/ViewNamespace.js";
import {Fireball, ThunderCloud, Shield, BuildSpell, IceWall} from "../Model/Spell.js";
import * as THREE from "three";
import {iceWall} from "../configs/SpellConfigs.js";

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
        switch (event.detail.type){
            case Fireball:
                entityModel = this.#createFireball(event.detail);
                break;
            case ThunderCloud:
                entityModel = this.#createThunderCloud(event.detail);
                break;
            case Shield:
                entityModel = this.#createShield(event.detail);
                break;
            case IceWall:
                entityModel = this.#createIceWall(event.detail);
                break;
            case BuildSpell:
                const customEvent = new CustomEvent('callBuildManager', {detail: event.detail});
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
        const spell = new details.type();
        let model = new Model.Projectile({
            spellType: spell,
            direction: details.params.direction,
            duration: spell.spell.duration,
            velocity: spell.spell.velocity,
            fallOf: spell.fallOf,
            position: details.params.position,
            team: details.params.team
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
        this.scene.add(view.boxHelper);
        model.addEventListener("updatePosition", view.updatePosition.bind(view));
        model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
        this.viewManager.addPair(model,view);
        return model;
    }

    /**
     * Creates thunder cloud model and view
     * @param details
     * @return {*}
     */
    #createThunderCloud(details){
        const spell = new details.type();
        let model = new Model.Immobile({
            spellType: spell,
            position: details.params.position,
            duration: spell.spell.duration,
            team: details.params.team
        });
        let position = new THREE.Vector3().copy(details.params.position);
        position.y += 15;
        let view = new View.ThunderCloud({
            camera: this.camera,
            texture: this.assetManager.getAsset("cloud"),
            position: position
        });

        this.scene.add(view.charModel);

        view.boundingBox.set(new THREE.Vector3().copy(position).sub(new THREE.Vector3(4,15,4)), new THREE.Vector3().copy(position).add(new THREE.Vector3(4,0.5,4)));
        this.scene.add(view.boxHelper);
        model.addEventListener("updatePosition", view.updatePosition.bind(view));
        model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
        this.viewManager.addPair(model,view);
        return model;
    }

    /**
     * Creates shield model and view
     * @param details
     * @return {*}
     */
    #createShield(details){
        const spell = new details.type();
        let model = new Model.FollowPlayer({
            target: this.viewManager.pairs.player[0].model, //TODO: change this implementation, don't keep player as a property
            spellType: spell,
            position: details.params.position,
            duration: spell.spell.duration,
            team: details.params.team
        });

        let view = new View.Shield({
            camera: this.camera,
            position: details.params.position
        });

        this.scene.add(view.charModel);
        model.addEventListener("updatePosition", view.updatePosition.bind(view));
        model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
        this.viewManager.addPair(model,view);
        return model;
    }

    //TODO: can we remove this?
    /**
     * not used
     * @param details
     * @return {*}
     */
    createRitualSpell(details){
        let model = new Model.RitualSpell({
            spellType: details.type,
            // position: details.params.position
        });
        let view = new View.RitualSpell({
            camera: this.camera,
            // position: details.params.position,
            charModel: this.assetManager.getAsset("RitualSpell")
        });
        view.loadAnimations(this.assetManager.getAnimations("RitualSpell"));
        this.scene.add(view.charModel);
        model.addEventListener("updatePosition", view.updatePosition.bind(view));
        model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
        this.models.push(model);
        this.viewManager.addPair(model,view);
        return model;
    }

    /**
     * Creates ice wall model and view
     * @param details
     * @return {*}
     */
    #createIceWall(details) {
        const spell = new details.type();
        let position = new THREE.Vector3().copy(details.params.position);
        position.y -= 7;
        let model = new Model.MobileCollidable({
            spellType: spell,
            position: position,
            moveFunction: spell.spell.moveFunction,
            moveFunctionParams: spell.spell.moveFunctionParams,
            duration: spell.spell.duration
        });
        let views = View.IceWall({
            charModel: this.assetManager.getAsset("iceBlock"),
            position: position,
            horizontalRotation: details.params.horizontalRotation
        });

        views.forEach((view) => {
            this.scene.add(view.charModel);
            this.scene.add(view.boxHelper);
            model.addEventListener("updatePosition", view.updatePosition.bind(view));
            model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
            this.viewManager.addPair(model,view);
        });

        return model;
    }
}