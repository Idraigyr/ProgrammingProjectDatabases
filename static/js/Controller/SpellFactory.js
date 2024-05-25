import {Controller} from "./Controller.js";
import {Model} from "../Model/ModelNamespace.js";
import {View} from "../View/ViewNamespace.js";
import {Fireball, ThunderCloud, Shield, BuildSpell, IceWall} from "../Model/Spell.js";
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
        this.assetManager = params.assetManager;
        //TODO: change this
        this.models = [];
        this.spellNumber = 0;
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
            default:
                console.log("Spell type not found");
                break;
        }
        if(!entityModel) return;
        this.models.push(entityModel);
        entityModel.setId(this.spellNumber)
        this.spellNumber++;
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
            team: details.params.team,
            canDamage: details?.canDamage ?? true
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
        if(view.boxHelper) this.scene.add(view.boxHelper);
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
            team: details.params.team,
            canDamage: details?.canDamage ?? true
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
        if(view.boxHelper) this.scene.add(view.boxHelper);
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
        const target = this.viewManager.getPlayerModelByID(details.params.playerID);
        let model = new Model.FollowPlayer({
            target: target, //TODO: change this implementation, don't keep player as a property
            spellType: spell,
            position: details.params.position,
            duration: spell.spell.duration,
            team: details.params.team
        });

        let view = new View.Shield({
            camera: this.camera,
            position: details.params.position
        });
        target.setShielded(true);
        model.addEventListener("shieldLost", view.loseShield.bind(view));
        this.scene.add(view.charModel);
        model.addEventListener("updatePosition", view.updatePosition.bind(view));
        model.addEventListener("delete", target.setShielded(false));
        model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
        view.boundingBox.set(details.params.position.clone().sub(new THREE.Vector3(1,0,1)), details.params.position.clone().add(new THREE.Vector3(1,3.5,1)));
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
            if(view.boxHelper) this.scene.add(view.boxHelper);
            model.addEventListener("updatePosition", view.updatePosition.bind(view));
            model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
            this.viewManager.addPair(model,view);
        });

        return model;
    }
}