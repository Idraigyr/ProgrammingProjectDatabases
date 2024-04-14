import {Model} from "../Model/Model.js";
import {View} from "../View/ViewNamespace.js";
import {MinionFSM, PlayerFSM} from "./CharacterFSM.js";
import {convertGridIndexToWorldPosition, convertWorldToGridPosition, correctRitualScale, setMinimumY} from "../helpers.js";
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

    /**
     * Creates minion model and view
     * @param {{spawn: THREE.vector3, type: "Minion" | "Mage" | "Warrrior" | "Rogue"}} params
     * @return {Minion}
     */
    createMinion(params){
        let currentPos = new THREE.Vector3(params.spawn.x,params.spawn.y,params.spawn.z);
        const height = 2.5;
        let model = new Model.Minion({spawnPoint: currentPos, position: currentPos, height: height, team: 1});
        let view = new View.Minion({charModel: this.assetManager.getAsset(params.type), position: currentPos, horizontalRotation: 135});
        //add weapon to hand
        view.charModel.traverse((child) => {
            if(child.name === "handIKr") {
                //TODO: make mored dynamic currently is only right for axe, staff and sword
                const weapon = this.assetManager.getAsset("SkeletonBlade");
                weapon.position.set(0,0.1,0);
                weapon.quaternion.setFromAxisAngle(new THREE.Vector3(0,0,1), Math.PI/2);
                const quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), Math.PI);
                weapon.quaternion.multiply(quaternion);
                child.add(weapon);
            }
        });

        this.scene.add(view.charModel);

        //view.boundingBox.setFromObject(view.charModel.children[0].children[0]);
        view.boundingBox.set(new THREE.Vector3().copy(currentPos).sub(new THREE.Vector3(0.5,0,0.5)), new THREE.Vector3().copy(currentPos).add(new THREE.Vector3(0.5,height,0.5)));
        this.scene.add(view.boxHelper);

        view.loadAnimations(this.assetManager.getAnimations(params.type));

        model.fsm = new MinionFSM(view.animations);
        model.addEventListener("updatePosition",view.updatePosition.bind(view));
        model.addEventListener("updateRotation",view.updateRotation.bind(view));

        this.viewManager.addPair(model, view);
        return model;
    }

    /**
     * Creates player model and view
     * @returns {Wizard}
     */
    createPlayer(params){
        // let sp = new THREE.Vector3(-8,15,12);
        let sp = new THREE.Vector3(playerSpawn.x,playerSpawn.y,playerSpawn.z);
        let currentPos = new THREE.Vector3(params.position.x,params.position.y,params.position.z);
        //TODO: remove hardcoded height
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
     * Creates bridge model and view
     * @param {{position: THREE.Vector3, rotation: number, width: number, length: number}} params
     * @return {Bridge}
     */
    createBridge(params){
        let bridgeModel = new Model.Bridge({position: new THREE.Vector3(params.position.x, params.position.y, params.position.z), rotation: params.rotation, width: params.width, length: params.length});
        let view = new View.Bridge({position: new THREE.Vector3(params.position.x, params.position.y, params.position.z), width: params.width, length: params.length, thickness: 0.1});

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
     * @param {{position: THREE.Vector3, rotation: number, width: number, length: number, buildingsList: Object[]}} params
     * @returns model of the island
     */
    createIsland(params){
        let islandModel = new Model.Island({position: new THREE.Vector3(params.position.x, params.position.y, params.position.z), rotation: params.rotation, width: params.width, length: params.length});

        let view = new View.Island({position: new THREE.Vector3(params.position.x, params.position.y, params.position.z), width: params.width, length: params.length, islandThickness: 0.1}); //TODO: remove magic numbers
        //TODO: island asset?
        //this.AssetLoader.loadAsset(view);
        this.scene.add(view.initScene());

        view.boundingBox.setFromObject(view.charModel);
        //check Foundation class for new min and max specification
        // islandModel.min = view.boundingBox.min.clone();
        // islandModel.max = view.boundingBox.max.clone();
        this.scene.add(view.boxHelper);

        this.#addBuildings(islandModel, params.buildingsList);

        this.viewManager.addPair(islandModel, view);
        return islandModel;
    }

    /**
     * Creates building model and view
     * @param {{position: THREE.Vector3, buildingName: string, withTimer: boolean, id: number}} params name of the building
     * @returns {Placeable} model of the building
     */
    //TODO: change arguments => params (= more more extendable)
    createBuilding(params){
        const asset = this.assetManager.getAsset(params.buildingName);
        correctRitualScale(asset);
        setMinimumY(asset, 0); // TODO: is it always 0?
        let pos = new THREE.Vector3(params.position.x, asset.position.y, params.position.z);
        // Correct position to place the asset in the center of the cell
        convertGridIndexToWorldPosition(pos);
        // Convert position
        const model = new Model[params.buildingName]({position: pos, id: params.id}); // TODO: add rotation
        const view = new View[params.buildingName]({charModel: asset, position: pos, scene: this.scene});

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

        if(params.withTimer){
            // Copy asset object
            const assetClone = asset.clone();
            //TODO: find solution invisible THREE.Object3D do not become a part of staticGeometrywith generateCollider function
            view.charModel.visible = false;
            // Set that model is not ready
            model.ready = false;
            // Create timer
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
            const watch = new View.Watch({position: pos, time: model.timeToBuild, scene: this.scene, font: this.assetManager.getAsset("SurabanglusFont")});
            // Add callback to update view with the up-to-date time
            timer.addRuntimeCallback((time=timer.duration-timer.timer) => watch.setTimeView(time));
            // Rotate the watch view each step
            timer.addRuntimeCallback((deltaTime=timer.deltaTime) => {
                watch.charModel.rotation.y += 2*deltaTime;
            });
            // Remove watch view when the timer ends
            timer.addCallback(() => {
                this.scene.remove(watch.charModel);
                model.ready = true;
            }
            )
        }
        return model;
    }

    /**
     * Creates models of the buildings
     * @param {Island} islandModel island (Model) to add the buildings to
     * @param {Object} buildingsList list of the buildings to add
     */
    #addBuildings(islandModel, buildingsList){
        buildingsList.forEach((building) => {
            try {
                islandModel.addBuilding(this.createBuilding({buildingName: building.type,position: building.position, withTimer: false, id: building.id}));
            } catch (e){
                console.error(`no ctor for ${building.type} building: ${e.message}`);
            }
        });
    }
}