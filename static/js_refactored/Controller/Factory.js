import {Model} from "../Model/Model.js";
import {View} from "../View/ViewNamespace.js";
import {Controller} from "./Controller.js";
import {PlayerFSM} from "./CharacterFSM.js";
import {getFileExtension} from "../helpers.js";

export class Factory{
    //TODO: add factory itself and model class of object to view.userData
    constructor(scene) {
        this.scene = scene;
        this.AssetLoader = new Controller.AssetLoader(this.scene);
        this.views = [];
    }
    loadAsset(view){
        let extension = getFileExtension(view.assetPath);
        if(extension === "glb" || extension === "gltf"){
            this.AssetLoader.loadGLTF(view.assetPath,view);
        } else if(extension === "fbx"){
            this.AssetLoader.loadFBX(view.assetPath,view);
        } else {
            throw new Error(`cannot load model with .${extension} extension`);
        }
    }

    createMinion(){

    }

    createPlayer(){
        let player = new Model.Wizard();
        let view = new View.Player();

        player.fsm = new PlayerFSM(view.animations);
        this.loadAsset(view);
        player.addEventListener("updatePosition",view.updatePosition.bind(view));
        player.addEventListener("updateRotation",view.updateRotation.bind(view));

        this.views.push(view);
        return player;
    }
    createIsland(position, rotation, buildingsList){
        let islandModel = new Model.Island(position, rotation);
        let view = new View.Island();

        //TODO: island asset?
        this.addBuildings(islandModel.buildings,view.buildings,buildingsList);
        this.scene.add(view.initScene());

        this.views.push(view);
        return islandModel;
    }
    addBuildings(islandModel, islandView, buildingsList){
        buildingsList.forEach((building) => {
            try {
                let model = new Model[building.type](building.position,building.rotation);
                let view = new View[building.type](building.position,building.rotation);
                model.addEventListener("updatePosition",view.updatePosition.bind(view));
                model.addEventListener("updateRotation",view.updateRotation.bind(view));
                this.AssetLoader.loadGLTF(view.assetPath,view);
                islandModel.push(model);
                islandView.push(view);
            } catch (e){
                console.log(`no ctor for ${building.type} building: ${e.message}`);
            }
        });
    }
    createFireball(){
        // let fireball = new Model.Fireball();
        // let view = new View.Fireball();
        // this.AssetLoader.loadGLTF("./assets/Wizard.glb",view);
        // return fireball;
    }
}