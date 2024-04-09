import {Model} from "../Model/Model.js";
import {View} from "../View/ViewNamespace.js";
import {Controller} from "./Controller.js";
import {PlayerFSM} from "./CharacterFSM.js";
import {convertGridToWorldPosition, correctRitualScale, getFileExtension, setMinimumY, convertWorldToGridPosition} from "../helpers.js";
import * as THREE from "three";
import {playerSpawn} from "../configs/ControllerConfigs.js";
import {SpellSpawner} from "../Model/SpellSpawner.js";
import {scaleAndCorrectPosition} from "../helpers.js";

/**
 * Factory class that creates models and views for the entities
 */
export class Factory{
    //TODO: add factory itself and model class of object to view.userData
    constructor(params) {
        this.scene = params.scene;
        this.viewManager = params.viewManager;
        this.assetManager = params.assetManager;
    }

    createMinion(){

    }

    /**
     * Creates player model and view
     * @returns {Wizard}
     */
    createPlayer(params){
        // let sp = new THREE.Vector3(-8,15,12);
        let sp = new THREE.Vector3(playerSpawn.x,playerSpawn.y,playerSpawn.z);
        let currentPos = new THREE.Vector3(params.position.x,params.position.y,params.position.z);
        const height = 3;
        let player = new Model.Wizard({spawnPoint: sp, position: currentPos, height: height, maxMana: params.maxMana, mana: params.mana});
        let view = new View.Player({charModel: this.assetManager.getAsset("Player"), position: currentPos});

        this.scene.add(view.charModel);

        //view.boundingBox.setFromObject(view.charModel.children[0].children[0]);
        view.boundingBox.set(new THREE.Vector3().copy(currentPos).sub(new THREE.Vector3(0.5,0,0.5)), new THREE.Vector3().copy(currentPos).add(new THREE.Vector3(0.5,height,0.5)));
        this.scene.add(view.boxHelper);

        view.loadAnimations(this.assetManager.getAnimations("Player"));

        player.fsm = new PlayerFSM(view.animations);
        player.addEventListener("updatePosition",view.updatePosition.bind(view));
        player.addEventListener("updateRotation",view.updateRotation.bind(view));

        this.viewManager.addPair(player, view);
        return player;
    }

    createTower(params){
        const asset = this.assetManager.getAsset("Tower");
        correctRitualScale(asset);
        let currentPos = new THREE.Vector3(params.position.x,params.position.y,params.position.z);
        convertWorldToGridPosition(currentPos);
        let tower = new Model.Tower({position: currentPos, spellSpawner: new SpellSpawner({})});
        let view = new View.Tower({charModel: asset, position: currentPos});
        this.scene.add(view.charModel);

        view.boundingBox.setFromObject(view.charModel);
        this.scene.add(view.boxHelper);

        tower.addEventListener("updatePosition",view.updatePosition.bind(view));
        tower.addEventListener("updateRotation",view.updateRotation.bind(view));

        this.viewManager.addPair(tower, view);
        return tower;
    }

    /**
     * Creates island model and view
     * @param position position of the island
     * @param rotation rotation of the island
     * @param buildingsList list of the buildings to add
     * @returns model of the island
     */
    createIsland(position, rotation, buildingsList){
        let islandModel = new Model.Island({position: new THREE.Vector3(position.x, position.y, position.z), rotation: rotation});

        let view = new View.Island({position: new THREE.Vector3(position.x, position.y, position.z), cellsInRow: 15, islandThickness: 10});
        //TODO: island asset?
        //this.AssetLoader.loadAsset(view);
        this.scene.add(view.initScene());

        view.boundingBox.setFromObject(view.charModel);
        this.scene.add(view.boxHelper);

        this.#addBuildings(islandModel.buildings, buildingsList);

        this.viewManager.addPair(islandModel, view);
        return islandModel;
    }

    createBuilding(buildingName, position){
        const asset = this.assetManager.getAsset(buildingName);
        correctRitualScale(asset);
        setMinimumY(asset, 0); // TODO: is it always 0?
        // Correct position to place the asset in the center of the cell
        convertWorldToGridPosition(position);
        let pos = new THREE.Vector3(position.x, asset.position.y, position.z);
        // Convert position
        let model = new Model[buildingName]({position: pos}); // TODO: add rotation
        let view = new View[buildingName]({charModel: asset, position: pos, scene: this.scene});
        this.scene.add(view.charModel);

        view.boundingBox.setFromObject(view.charModel);
        this.scene.add(view.boxHelper);

        model.addEventListener("updatePosition",view.updatePosition.bind(view));
        model.addEventListener("updateRotation",view.updateRotation.bind(view));
        this.viewManager.addPair(model, view);
        return model;
    }

    /**
     * Creates models of the buildings
     * @param islandModels (output) models
     * @param buildingsList list of the buildings to add
     */
    #addBuildings(islandModels, buildingsList){
        buildingsList.forEach((building) => {
            try {
                const asset = this.assetManager.getAsset(building.type);
                correctRitualScale(asset);
                setMinimumY(asset, 0); // TODO: is it always 0?
                let pos = new THREE.Vector3(building.position.x, asset.position.y, building.position.z);
                convertGridToWorldPosition(pos);
                let model = new Model[building.type]({position: pos, rotation: building.rotation});
                let view = new View[building.type]({charModel: asset, position: pos, scene: this.scene});
                this.scene.add(view.charModel);

                view.boundingBox.setFromObject(view.charModel);
                this.scene.add(view.boxHelper);

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