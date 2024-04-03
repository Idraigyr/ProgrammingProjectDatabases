import {Model} from "../Model/Model.js";
import {View} from "../View/ViewNamespace.js";
import {PlayerFSM} from "./CharacterFSM.js";
import {convertGridToWorldPosition, convertWorldToGridPosition, correctRitualScale, setMinimumY, getOccupiedCells} from "../helpers.js";
import * as THREE from "three";
import {playerSpawn} from "../configs/ControllerConfigs.js";

/**
 * Factory class that creates models and views for the entities
 */
export class Factory{
    //TODO: add factory itself and model class of object to view.userData
    constructor(params) {
        this.scene = params.scene;
        this.viewManager = params.viewManager;
        this.assetManager = params.assetManager;
        this.timerManager = params.timerManager;
    }

    createMinion(){

    }

    /**
     * Creates player model and view
     * @returns {Wizard}
     */
    createPlayer(position){
        // let sp = new THREE.Vector3(-8,15,12);
        let sp = new THREE.Vector3(playerSpawn.x,playerSpawn.y,playerSpawn.z);
        let currentPos = new THREE.Vector3(position.x,position.y,position.z);
        const height = 3;
        let player = new Model.Wizard({spawnPoint: sp, position: currentPos, height: height});
        let view = new View.Player({charModel: this.assetManager.getAsset("Player"), position: currentPos});

        this.scene.add(view.charModel);

        //view.boundingBox.setFromObject(view.charModel.children[0].children[0]);
        view.boundingBox.set(new THREE.Vector3(-0.5,0,-0.5), new THREE.Vector3(0.5,height,0.5));
        this.scene.add(view.boxHelper);

        view.loadAnimations(this.assetManager.getAnimations("Player"));

        player.fsm = new PlayerFSM(view.animations);
        player.addEventListener("updatePosition",view.updatePosition.bind(view));
        player.addEventListener("updateRotation",view.updateRotation.bind(view));

        this.viewManager.addPair(player, view);
        return player;
    }

    /**
     * Creates island model and view
     * @param position position of the island
     * @param rotation rotation of the island
     * @param buildingsList list of the buildings to add
     * @returns model of the island
     */
    createIsland(position, rotation, buildingsList){
        let islandModel = new Model.Island(position, rotation);
        let view = new View.Island();
        //TODO: island asset?
        //this.AssetLoader.loadAsset(view);
        this.scene.add(view.initScene());

        view.boundingBox.setFromObject(view.charModel);
        this.scene.add(view.boxHelper);

        this.#addBuildings(islandModel.buildings, buildingsList);

        this.viewManager.addPair(islandModel, view);
        return islandModel;
    }

    /**
     * Creates building model and view
     * @param buildingName name of the building
     * @param position position of the building
     * @param withTimer if true, the building will be created with timer
     * @returns {*} model of the building
     */
    createBuilding(buildingName, position, withTimer=false){
        const asset = this.assetManager.getAsset(buildingName);
        correctRitualScale(asset);
        setMinimumY(asset, 0); // TODO: is it always 0?
        let pos = new THREE.Vector3(position.x, asset.position.y, position.z);
        // Correct position to place the asset in the center of the cell
        convertWorldToGridPosition(pos);
        // Convert position
        let model = new Model[buildingName]({position: pos}); // TODO: add rotation
        let view = new View[buildingName]({charModel: asset, position: pos, scene: this.scene});
        // Occupy the cells
        model.occupiedCells = getOccupiedCells(view.charModel);
        this.scene.add(view.charModel);

        view.boundingBox.setFromObject(view.charModel);
        this.scene.add(view.boxHelper);

        model.addEventListener("updatePosition",view.updatePosition.bind(view));
        model.addEventListener("updateRotation",view.updateRotation.bind(view));
        this.viewManager.addPair(model, view);
        if(withTimer){
            // Copy asset object
            let copyAsset = asset.clone();
            // Traverse the original asset to make it green semi-transparent
            asset.traverse((o) => {
                if (o.isMesh) o.material = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
            });
            this.timerManager.createTimer(model, model.timeToBuild,
                new CustomEvent("changeViewAsset", {detail: {model: model, viewAsset: copyAsset}}));
        }
        return model;
    }

    /**
     * Creates models of the buildings
     * @param resultedModels list with output models added
     * @param buildingsList list of the buildings to add
     */
    #addBuildings(resultedModels, buildingsList){
        buildingsList.forEach((building) => {
            try {
                // TODO: understand why the following code gives another result:
                // let model = this.createBuilding(building.type, building.position);
                // resultedModels.push(model);
                const asset = this.assetManager.getAsset(building.type);
                correctRitualScale(asset);
                setMinimumY(asset, 0); // TODO: is it always 0?
                let pos = new THREE.Vector3(building.position.x, asset.position.y, building.position.z);
                convertGridToWorldPosition(pos);
                console.log(pos);
                let model = new Model[building.type]({position: pos, rotation: building.rotation});
                let view = new View[building.type]({charModel: asset, position: pos, scene: this.scene});
                // Occupy the cells
                model.occupiedCells = getOccupiedCells(view.charModel);
                this.scene.add(view.charModel);

                view.boundingBox.setFromObject(view.charModel);
                this.scene.add(view.boxHelper);

                model.addEventListener("updatePosition",view.updatePosition.bind(view));
                model.addEventListener("updateRotation",view.updateRotation.bind(view));
                resultedModels.push(model);
                this.viewManager.addPair(model, view);
            } catch (e){
                console.log(`no ctor for ${building.type} building: ${e.message}`);
            }
        });
    }
}