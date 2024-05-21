import {Model} from "../Model/ModelNamespace.js";
import {View} from "../View/ViewNamespace.js";
import {MinionFSM, PlayerFSM} from "./CharacterFSM.js";
import {convertGridIndexToWorldPosition} from "../helpers.js";
import * as THREE from "three";
import {playerSpawn} from "../configs/ControllerConfigs.js";
import {displayViewBoxHelper, gridCellSize} from "../configs/ViewConfigs.js";
import {Timer3D} from "../View/Watch.js";

/**
 * Factory class that creates models and views for the entities
 */
export class Factory{
    #currentTime;

    /**
     * Constructor for the factory
     * @param {{scene: THREE.Scene, viewManager: ViewManager, assetManager: AssetManager, timerManager: timerManager, collisionDetector: collisionDetector, camera: Camera}} params
     */
    constructor(params) {
        this.scene = params.scene;
        this.viewManager = params.viewManager;
        this.assetManager = params.assetManager;
        this.timerManager = params.timerManager;
        this.collisionDetector = params.collisionDetector;
        this.camera = params.camera;
        this.#currentTime = null;
    }

    /**
     * Setter for the current time
     * @param {Date} time
     */
    set currentTime(time){
        this.#currentTime = time;
    }

    /**
     * Getter for the current time
     * @return {Date | Error} throws error if the current time is not set
     */
    get currentTime(){
        if(!this.#currentTime) throw new Error("currentTime is not set");
        return this.#currentTime;
    }




    /**
     * Creates minion model and view
     * @param {{spawn: THREE.vector3, type: "Minion" | "Mage" | "Warrrior" | "Rogue", buildingID: number, team: number}} params - spawn needs to be in world coords, buildingID is the id of the building that spawned the minion (buildingID is only used for friendly minions)
     * @return {Minion}
     */
    createMinion(params){
        let currentPos = new THREE.Vector3(params.spawn.x,params.spawn.y,params.spawn.z);
        const height = 2.5;
        let model = new Model.Minion({
            spawnPoint: currentPos,
            position: currentPos,
            height: height,
            team: params.team,
            buildingID: params.buildingID,
            minionType: params.type,
            mass: 20
        });
        let view = new View.Minion({charModel: this.assetManager.getAsset(params.type), position: currentPos, horizontalRotation: 25,camera: this.camera});
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
        this.scene.add(view.healthBar);


        //view.boundingBox.setFromObject(view.charModel.children[0].children[0]);
        view.boundingBox.set(new THREE.Vector3().copy(currentPos).sub(new THREE.Vector3(0.5,0,0.5)), new THREE.Vector3().copy(currentPos).add(new THREE.Vector3(0.5,height,0.5)));
        if(displayViewBoxHelper){
            this.scene.add(view.boxHelper);
        }

        view.loadAnimations(this.assetManager.getAnimations(params.type));

        model.fsm = new MinionFSM(view.animations);
        model.addEventListener("updatePosition",view.updatePosition.bind(view));
        model.addEventListener("updateRotation",view.updateRotation.bind(view));
        model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
        model.addEventListener("updateHealth",view.OnHealth_.bind(view));

        this.viewManager.addPair(model, view);
        return model;
    }

    /**
     * Creates player model and view
     * @param {{position: THREE.Vector3, maxMana: number, mana: number, maxHealth: number, health: number, team: 0 | 1 | undefined | null}} params
     * @returns {Wizard}
     */
    createPlayer(params){
        // let sp = new THREE.Vector3(-8,15,12);
        let sp = new THREE.Vector3(playerSpawn.x,playerSpawn.y,playerSpawn.z);
        let currentPos = new THREE.Vector3(params.position.x,params.position.y,params.position.z);
        //TODO: remove hardcoded height
        const height = 3;
        let player = new Model.Wizard({
            spawnPoint: sp,
            position: currentPos,
            height: height,
            health: params.health,
            maxHealth: params.maxHealth,
            maxMana: params.maxMana,
            mana: params.mana,
            team: params?.team ?? 0,
            mass: 20
        });
        let view = new View.Player({charModel: this.assetManager.getAsset("Player"), position: currentPos, camera: this.camera});

        this.scene.add(view.charModel);


        //view.boundingBox.setFromObject(view.charModel.children[0].children[0]);
        view.boundingBox.set(currentPos.clone().sub(new THREE.Vector3(0.5,0,0.5)), currentPos.clone().add(new THREE.Vector3(0.5,height,0.5)));
        if(displayViewBoxHelper){
            this.scene.add(view.boxHelper);
        }

        view.loadAnimations(this.assetManager.getAnimations("Player"));

        player.fsm = new PlayerFSM(view.animations);
        player.addEventListener("updatePosition",view.updatePosition.bind(view));
        player.addEventListener("updateRotation",view.updateRotation.bind(view));
        player.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
        player.addEventListener("updateHealth",view.OnHealth_.bind(view));

        this.viewManager.addPair(player, view);
        return player;
    }

    createPeer(params){
        // let sp = new THREE.Vector3(-8,15,12);
        let sp = new THREE.Vector3(playerSpawn.x,playerSpawn.y,playerSpawn.z);
        let currentPos = new THREE.Vector3(params.position.x,params.position.y,params.position.z);
        //TODO: remove hardcoded height
        const height = 3;
        let player = new Model.Character({
            spawnPoint: sp,
            position: currentPos,
            height: height,
            health: params.health,
            maxHealth: params.maxHealth,
            team: params?.team ?? 0,
            mass: 20
        });
        let view = new View.Player({charModel: this.assetManager.getAsset("Player"), position: currentPos, camera: this.camera});

        this.scene.add(view.charModel);
        this.scene.add(view.healthBar);


        //view.boundingBox.setFromObject(view.charModel.children[0].children[0]);
        view.boundingBox.set(new THREE.Vector3().copy(currentPos).sub(new THREE.Vector3(0.5,0,0.5)), new THREE.Vector3().copy(currentPos).add(new THREE.Vector3(0.5,height,0.5)));
        if(displayViewBoxHelper){
            this.scene.add(view.boxHelper);
        }

        view.loadAnimations(this.assetManager.getAnimations("Player"));

        player.fsm = new PlayerFSM(view.animations);
        player.addEventListener("updatePosition",view.updatePosition.bind(view));
        player.addEventListener("updateRotation",view.updateRotation.bind(view));
        player.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
        player.addEventListener("updateHealth",view.OnHealth_.bind(view));


        this.viewManager.addPair(player, view);
        return player;
    }

    /**
     * Creates bridge model and view
     * @param {{position: THREE.Vector3, rotation: number, width: number, length: number, team: number}} params
     * @return {Bridge}
     */
    createBridge(params){
        let bridgeModel = new Model.Bridge({position: new THREE.Vector3(params.position.x, params.position.y, params.position.z), rotation: params.rotation, width: params.width, length: params.length, team: params.team});
        let view = new View.Bridge({position: new THREE.Vector3(params.position.x, params.position.y, params.position.z), width: params.width, length: params.length, thickness: 0.1});

        this.scene.add(view.initScene());
        view.boundingBox.setFromObject(view.charModel);
        if(displayViewBoxHelper){
            this.scene.add(view.boxHelper);
        }

        bridgeModel.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));

        this.viewManager.addPair(bridgeModel, view);
        return bridgeModel;
    }

    /**
     * Creates island model and view
     * @param {{position: THREE.Vector3, rotation: number, width: number, length: number, buildingsList: Object[], team: number | null}} params
     * @returns {Island} model of the island
     */
    createIsland(params){
        let islandModel = new Model.Island({position: new THREE.Vector3(params.position.x, params.position.y, params.position.z), width: params.width, length: params.length, team: params.team});

        let view = new View.Island({position: new THREE.Vector3(params.position.x, params.position.y, params.position.z), width: params.width, length: params.length, islandThickness: 0.1}); //TODO: remove magic numbers
        //TODO: island asset?
        //this.AssetLoader.loadAsset(view);
        this.scene.add(view.initScene());

        view.boundingBox.setFromObject(view.charModel);
        if(displayViewBoxHelper){
            this.scene.add(view.boxHelper);
        }

        islandModel.addEventListener("updatePosition",view.updatePosition.bind(view));
        islandModel.addEventListener("updateRotation",view.updateRotation.bind(view));
        islandModel.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));

        this.#addBuildings(islandModel, params.buildingsList);

        islandModel.rotation = params.rotation;

        this.viewManager.addPair(islandModel, view);
        return islandModel;
    }

    /**
     * Creates building model and view
     * @param {{position: THREE.Vector3, buildingName: string, withTimer: boolean, id: number, rotation: number, gems: Object[] | undefined, stats: {name: string, value: number}[] | undefined, team: number, task: Object}} params - buildingName needs to correspond to the name of a building in the Model namespace, position needs to be in world coords
     * @returns {Placeable} model of the building
     */
    createBuilding(params){
        const asset = this.assetManager.getAsset(params.buildingName);
        let pos = new THREE.Vector3(params.position.x, asset.position.y, params.position.z);
        const modelParams = {position: pos, id: params.id, team: params.team};

        const model = new Model[params.buildingName](modelParams); // TODO: add rotation
        const view = new View[params.buildingName]({charModel: asset, position: pos, scene: this.scene});

        //TODO: remove and make dynamic
        if(params.stats){
            for(const stat of params.stats){
                model.addStat(stat.name, stat.value);
            }
        }

        if(params.gems){
            for(const gem of params.gems){
                model.addGem(gem);
            }
        }

        model.addEventListener("updatePosition",view.updatePosition.bind(view));
        model.addEventListener("updateBoundingBox",view.updateBoundingBox.bind(view));
        model.addEventListener("updateRotation",view.updateRotation.bind(view));
        model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));

        model.rotate(params.rotation);

        this.scene.add(view.charModel);

        view.boundingBox.setFromObject(view.charModel);
        if(displayViewBoxHelper){
            this.scene.add(view.boxHelper);
        }

        this.viewManager.addPair(model, view);

        //TODO: withTimer: (DONE?)
        // get total time from config/db
        // create a timer that has a callback that triggers when the timer ends
        // put the buildingPreview in dyingViews of viewManager
        // just make the buildingView invisible for the duration of the timer
        if (params.task){
            // Get if the timer is already finished
            const timeEnd = new Date(params.task.endtime);
            if(timeEnd < this.currentTime){
                return model;
            }
            params.withTimer = true;
            // Get difference in seconds
            const timeDiff = (timeEnd - this.currentTime)/1000;
            model.timeToBuild = timeDiff;
        }
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
                [() => { //callbacks: make view visible, set model ready and generate collider
                    view.charModel.visible = true;
                    }, () => {
                    model.ready = true;
                    this.collisionDetector.generateColliderOnWorker(); // TODO: find another solution
                }]
            );
            const buildingPreview = new View.BuildingPreview({
                charModel: assetClone,
                position: pos,
                timer: timer,
                timerModel: new Timer3D({
                    time: model.timeToBuild,
                    charWidth: gridCellSize/25,
                    position: pos.clone().setY(pos.y + gridCellSize/1.5),
                    charAccess: this.assetManager.requestTimerAssets(),
                })
            });
            this.viewManager.dyingViews.push(buildingPreview);
            this.scene.add(buildingPreview.charModel);
        }
        return model;
    }

    createProxy(params) {
        const asset = this.assetManager.getAsset(params.buildingName);
        let currentPos = new THREE.Vector3(params.position.x, params.position.y, params.position.z);

        //TODO: get health from a variable, so it is impacted by gems and level?
        let model = new Model[`${params.buildingName}Proxy`]({
                spawnPoint: currentPos,
                position: currentPos,
                team: params.team,
                health: 100,
                maxHealth: 100,
                buildingName: params.buildingName,
                building: params.building
            });

        let view = new View.ProxyView({
            position: currentPos,
            charModel: asset.clone(),
            scene: this.scene,
            camera: this.camera
        });
        if (params.buildingName === "Altar") { //TODO: make more dynamic
            const height = 9;
            view.boundingBox.set(new THREE.Vector3().copy(currentPos).sub(new THREE.Vector3(4,0,0.5)), new THREE.Vector3().copy(currentPos).add(new THREE.Vector3(4.2,height,0.5)));
            model.radius = Math.sqrt(4*4 + 0.5*0.5) + 0.5;
        }
        if (params.buildingName === "Tower") {
            const height = 33;
            view.boundingBox.set(new THREE.Vector3().copy(currentPos).sub(new THREE.Vector3(3,0,3)), new THREE.Vector3().copy(currentPos).add(new THREE.Vector3(3,height,3)));
            model.radius = Math.sqrt(3*3 + 3*3) + 0.5;
        }

        this.scene.add(view.healthBar);
        if(displayViewBoxHelper){
            this.scene.add(view.boxHelper);
        }
        model.addEventListener("updatePosition",view.updatePosition.bind(view));
        model.addEventListener("updateRotation",view.updateRotation.bind(view));
        model.addEventListener("updateHealth",view.OnHealth_.bind(view));
        model.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));

        this.viewManager.addPair(model, view);
        return model;

    }
    /**
     * Creates models of the buildings
     * @param {Island} islandModel island (Model) to add the buildings to
     * @param {{type: string, position: THREE.Vector3, id: number, gems: Object[] | undefined, stats: {name: string, value: number}[], task}[]} buildingsList list of the buildings to add
     * @throws {Error} if there is no constructor for the building
     */
    #addBuildings(islandModel, buildingsList){
        let position = new THREE.Vector3();
        buildingsList.forEach((building) => {
            try {
                position.set(building.position.x, building.position.y, building.position.z);
                convertGridIndexToWorldPosition(position);
                position.add(islandModel.position);
                islandModel.addBuilding(this.createBuilding({buildingName: building.type,position: position, rotation: building.rotation, withTimer: false, id: building.id, gems: building.gems, stats: building.stats, team: islandModel.team, task: building.task}));
            } catch (e){
                console.error(`no ctor for ${building.type} building: ${e.message}`);
            }
        });
    }
}