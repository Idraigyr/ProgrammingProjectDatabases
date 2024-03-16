import {Model} from "../Model/Model.js";
import {View} from "../View/ViewNamespace.js";
import {Controller} from "./Controller.js";
import {PlayerFSM} from "./CharacterFSM.js";
import {getFileExtension} from "../helpers.js";

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
        let view = new View.Player({charModel: this.assetManager.getModel("Player")});
        this.scene.add(view.charModel);
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
        this.#addBuildings(islandModel.buildings, buildingsList);

        this.viewManager.addPair(islandModel, view);
        return islandModel;
    }

    /**
     * Creates models of the buildings
     * @param islandModels (output) models
     * @param buildingsList list of the buildings to add
     */
    #addBuildings(islandModels, buildingsList){
        buildingsList.forEach((building) => {
            try {
                console.log(building);
                let model = new Model[building.type]({position: building.position, rotation: building.rotation});
                let view = new View[building.type]({charModel: this.assetManager.getModel(building.type)});
                this.scene.add(view.charModel);
                model.addEventListener("updatePosition",view.updatePosition.bind(view));
                model.addEventListener("updateRotation",view.updateRotation.bind(view));
                islandModels.push(model);
                this.viewManager.addPair(model, view);
            } catch (e){
                console.log(`no ctor for ${building.type} building: ${e.message}`);
            }
        });
    }
}