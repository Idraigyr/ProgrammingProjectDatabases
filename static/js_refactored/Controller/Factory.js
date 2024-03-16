import {Model} from "../Model/Model.js";
import {View} from "../View/ViewNamespace.js";
import {Controller} from "./Controller.js";
import {PlayerFSM} from "./CharacterFSM.js";
import {getFileExtension} from "../helpers.js";
import * as THREE from "three";

export class Factory{
    //TODO: add factory itself and model class of object to view.userData
    constructor(params) {
        this.scene = params.scene;
        this.viewManager = params.viewManager;
        this.assetManager = params.assetManager;
    }

    createMinion(){

    }

    createPlayer(){
        let player = new Model.Wizard();
        let view = new View.Player({charModel: this.assetManager.getAsset("Player")});

        this.scene.add(view.charModel);

        //view.boundingBox.setFromObject(view.charModel.children[0].children[0]);
        view.boundingBox.set(new THREE.Vector3(-0.5,0,-0.5), new THREE.Vector3(0.5,3,0.5));
        this.scene.add(view.boxHelper);

        view.loadAnimations(this.assetManager.getAnimations("Player"));

        player.fsm = new PlayerFSM(view.animations);
        player.addEventListener("updatePosition",view.updatePosition.bind(view));
        player.addEventListener("updateRotation",view.updateRotation.bind(view));

        this.viewManager.addPair(player, view);
        return player;
    }
    createIsland(position, rotation, buildingsList){
        let islandModel = new Model.Island(position, rotation);
        let view = new View.Island();
        view.initScene()
        //TODO: island asset?
        //this.AssetLoader.loadAsset(view);
        this.scene.add(view.charModel);

        view.boundingBox.setFromObject(view.charModel.children[1]);
        this.scene.add(view.boxHelper);

        this.#addBuildings(islandModel.buildings, buildingsList);

        this.viewManager.addPair(islandModel, view);
        return islandModel;
    }
    #addBuildings(islandModel, buildingsList){
        buildingsList.forEach((building) => {
            try {
                let model = new Model[building.type]({position: building.position, rotation: building.rotation});
                let view = new View[building.type]({charModel: this.assetManager.getAsset(building.type)});

                this.scene.add(view.charModel);

                view.boundingBox.setFromObject(view.charModel);
                this.scene.add(view.boxHelper);

                model.addEventListener("updatePosition",view.updatePosition.bind(view));
                model.addEventListener("updateRotation",view.updateRotation.bind(view));
                islandModel.push(model);
                this.viewManager.addPair(model, view);
            } catch (e){
                console.log(`no ctor for ${building.type} building: ${e.message}`);
            }
        });
    }
}