import {Model} from "../Model/Model.js";
import {View} from "../View/ViewNamespace.js";
import {PlayerFSM} from "./CharacterFSM.js";
import {convertGridIndexToWorldPosition, convertWorldToGridPosition, correctRitualScale, setMinimumY, getOccupiedCells} from "../helpers.js";
import * as THREE from "three";
import {playerSpawn} from "../configs/ControllerConfigs.js";
import {SpellSpawner} from "../Model/SpellSpawner.js";

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

    createBridge(params){
        let bridgeModel = new Model.Bridge({position: new THREE.Vector3(params.position.x, params.position.y, params.position.z), rotation: params.rotation, width: 3, length: 3});
        let view = new View.Bridge({position: new THREE.Vector3(params.position.x, params.position.y, params.position.z), cellsInRow: 3, islandThickness: 0.1});

        this.scene.add(view.initScene());
        view.boundingBox.setFromObject(view.charModel);
        //check Foundation class for new min and max specification
        // bridgeModel.min = view.boundingBox.min.clone();
        // bridgeModel.max = view.boundingBox.max.clone();
        this.scene.add(view.boxHelper);

        this.viewManager.addPair(bridgeModel, view);
        return bridgeModel;
    }

    /**
     * Creates island model and view
     * @param position position of the island
     * @param rotation rotation of the island
     * @param buildingsList list of the buildings to add
     * @returns model of the island
     */
    createIsland(position, rotation, buildingsList){
        let islandModel = new Model.Island({position: new THREE.Vector3(position.x, position.y, position.z), rotation: rotation, width: 15, length: 15});

        let view = new View.Island({position: new THREE.Vector3(position.x, position.y, position.z), cellsInRow: 15, islandThickness: 0.1});
        //TODO: island asset?
        //this.AssetLoader.loadAsset(view);
        this.scene.add(view.initScene());

        view.boundingBox.setFromObject(view.charModel);
        //check Foundation class for new min and max specification
        // islandModel.min = view.boundingBox.min.clone();
        // islandModel.max = view.boundingBox.max.clone();
        this.scene.add(view.boxHelper);

        this.#addBuildings(islandModel, buildingsList);

        this.viewManager.addPair(islandModel, view);
        return islandModel;
    }

    /**
     * Creates building model and view
     * @param buildingName name of the building
     * @param position position of the building, needs to be in grid index format
     * @param withTimer if true, the building will be created with timer
     * @returns {*} model of the building
     */
    //TODO: change arguments => params (= more more extendable)
    createBuilding(buildingName, position, withTimer=false){
        const asset = this.assetManager.getAsset(buildingName);
        correctRitualScale(asset);
        setMinimumY(asset, 0); // TODO: is it always 0?
        let pos = new THREE.Vector3(position.x, asset.position.y, position.z);
        // Correct position to place the asset in the center of the cell
        convertGridIndexToWorldPosition(pos);
        // Convert position
        const model = new Model[buildingName]({position: pos}); // TODO: add rotation
        const view = new View[buildingName]({charModel: asset, position: pos, scene: this.scene});

        this.scene.add(view.charModel);

        view.boundingBox.setFromObject(view.charModel);
        this.scene.add(view.boxHelper);

        model.addEventListener("updatePosition",view.updatePosition.bind(view));
        model.addEventListener("updateRotation",view.updateRotation.bind(view));
        this.viewManager.addPair(model, view);

        //TODO: withTimer:
        // get total time from config/db
        // create a timer that has a callback that triggers when the timer ends
        // put the buildingPreview in dyingViews of viewManager
        // just make the buildingView invisible for the duration of the timer

        if(withTimer){
            // Copy asset object
            const assetClone = asset.clone();
            //TODO: find solution invisible THREE.Object3D do not become a part of staticGeometrywith generateCollider function
            view.charModel.visible = false;

            const timer = this.timerManager.createTimer(
                model.timeToBuild,
                [() => {
                    view.charModel.visible = true;
                }]
            );
            const buildingPreview = new View.BuildingPreview({
                charModel: assetClone,
                position: pos,
                timer: timer
            });
            this.viewManager.dyingViews.push(buildingPreview);
            this.scene.add(buildingPreview.charModel);
            // Create visible watch to see time left
            const watch = new View.Watch({position: pos, time: model.timeToBuild, scene: this.scene});
        }
        return model;
    }

    /**
     * Creates models of the buildings
     * @param islandModel island (Model) to add the buildings to
     * @param buildingsList list of the buildings to add
     */
    #addBuildings(islandModel, buildingsList){
        buildingsList.forEach((building) => {
            try {
                islandModel.addBuilding(this.createBuilding(building.type, building.position, false));
            } catch (e){
                console.log(`no ctor for ${building.type} building: ${e.message}`);
            }
        });
    }
}