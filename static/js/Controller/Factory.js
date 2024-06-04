import {Model} from "../Model/ModelNamespace.js";
import {View} from "../View/ViewNamespace.js";
import {MinionFSM, PlayerFSM} from "./CharacterFSM.js";
import {convertGridIndexToWorldPosition} from "../helpers.js";
import {API_URL, buildingUpgradeURI, fuseTaskURI, placeableURI, taskURI} from "../configs/EndpointConfigs.js";
import * as THREE from "three";
import {fusionTime, playerSpawn} from "../configs/ControllerConfigs.js";
import {displayViewBoxHelper, gridCellSize} from "../configs/ViewConfigs.js";
import {Timer3D} from "../View/Watch.js";
import {Level} from "../configs/LevelConfigs.js";

/**
 * Factory class that creates models and views for the entities
 */
export class Factory{
    #currentTime;

    /**
     * Constructor for the factory
     * @param {{scene: THREE.Scene, viewManager: ViewManager, assetManager: AssetManager, timerManager: timerManager, collisionDetector: collisionDetector, camera: Camera, itemManager: ItemManager}} params
     */
    constructor(params) {
        this.scene = params.scene;
        this.viewManager = params.viewManager;
        this.assetManager = params.assetManager;
        this.timerManager = params.timerManager;
        this.collisionDetector = params.collisionDetector;
        this.camera = params.camera;
        this.itemManager = params.itemManager;
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
     * @param {{spawn: THREE.vector3, type: "Minion" | "Mage" | "Warrrior" | "Rogue", buildingID: number, team: number, spawner: MinionSpawner}} params - spawn needs to be in world coords, buildingID is the id of the building that spawned the minion (buildingID is only used for friendly minions)
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
        let view = new View.Minion({charModel: this.assetManager.getAsset(params.type), position: currentPos, horizontalRotation: 90,camera: this.camera});
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
        model.addEventListener("characterDied", () => {
            if(params.spawner) params.spawner.increaseMaxSpawns();
        });
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

    /**
     *  Creates a model and view of another player
     * @param params - position, health, maxHealth, team
     * @returns {*} - model of the player
     */
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

        let view = new View.Island({position: new THREE.Vector3(params.position.x, params.position.y, params.position.z), width: params.width, length: params.length, islandThickness: 0.1, model: this.assetManager.getAsset("Island")}); //TODO: remove magic numbers
        //this.AssetLoader.loadAsset(view);
        this.scene.add(view.initScene());

        view.boundingBox.setFromObject(view.charModel);
        if(displayViewBoxHelper){
            this.scene.add(view.boxHelper);
        }

        islandModel.addEventListener("updatePosition",view.updatePosition.bind(view));
        islandModel.addEventListener("updateRotation",view.updateRotation.bind(view));
        islandModel.addEventListener("delete", this.viewManager.deleteView.bind(this.viewManager));
        islandModel.addEventListener("toggleGrass",view.toggleGrassField.bind(view));

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
        const modelParams = {position: pos, id: params.id, team: params.team, level: params.level};

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
        model.addEventListener("updateReady",view.updateReady.bind(view));

        model.rotate(params.rotation);

        this.scene.add(view.charModel);

        view.boundingBox.setFromObject(view.charModel);
        if(displayViewBoxHelper){
            this.scene.add(view.boxHelper);
        }

        this.viewManager.addPair(model, view);

        if (params.task){
            // Get if the timer is already finished
            const timeEnd = new Date(params.task.endtime);
            // Start of black magic -> TODO: refactor by just getting currentTime from server
            const offsetRegex = /([+-]\d{2}):(\d{2})$/;
            const match = params.task.starttime.match(offsetRegex);
            let sign, hours, minutes;
            if (match) {
                sign = match[1][0]; // + or -
                hours = match[1].slice(1); // hours part
                minutes = match[2]; // minutes part
                let formattedOffset = `${sign}${hours}:${minutes}`;

                console.log(`Time offset: ${formattedOffset}`);
            } else {
                console.log("No offset found in the string");
            }
            // Alright, now we have sign, hours and minutes of the server offset
            // Now we have to convert them to milliseconds
            let offset = 0;
            if (sign === "+") {
                offset = (parseInt(hours) * 60 + parseInt(minutes)) * 60 * 1000;
            }else if (sign === "-") {
                offset = -(parseInt(hours) * 60 + parseInt(minutes)) * 60 * 1000;
            }
            // Let's compare offset of the local time and the server time
            let localOffset = new Date().getTimezoneOffset() * 60 * 1000;
            let offsetDif = offset + localOffset;
            console.log(`Offset difference: ${offsetDif}`, `Local offset: ${localOffset}`, `Server offset: ${offset}`);
            // Fix timeEnd
            timeEnd.setTime(timeEnd.getTime() + offsetDif);
            // End of black magic
            if(timeEnd < this.currentTime){
                if(params.task.type === "building_upgrade_task") {
                    params.model = model;
                    this.levelUpBuilding(params);
                }
                else if (params.task.type === "fuse_task") {
                    // Time to create a new gem!
                    const fusionLevel = model.level;
                    const inputCrystals = params.task.crystal_amount;
                    const stats = model.getStats();
                    const fortune = stats.get("fortune") ?? 1;
                    this.itemManager.createGem((fusionLevel + inputCrystals/10 * fortune));
                }
                return model;
            } else if (params.task.type === "fuse_task"){
                const fusionLevel = model.level;
                const inputCrystals = params.task.crystal_amount;
                const stats = model.getStats();
                const fortune = stats.get("fortune") ?? 1;
                this.timerManager.createTimer((timeEnd - this.currentTime) / 1000, [async () => {
                    // get info of the task
                    // const res = await this.#getFuseTaskParams(params, model);
                    const gem = this.itemManager.createGem((fusionLevel + inputCrystals / 10 * fortune)); //TODO: make this parameter persistent? & don't just put a magic formula here
                    // Delete the old task
                    $.ajax({
                        url: `${API_URL}/${taskURI}?id=${params.task.id}`,
                        type: "DELETE",
                        contentType: "application/json",
                        success: (data) => {
                            console.log(data);
                        },
                        error: (xhr, status, error) => {
                            console.error(xhr.responseText);
                            console.log("Task ", params.task.id, " cannot be deleted");
                        }
                    })
                    // this.menuManager.addItemrenderM({item: gem, icon: {src: gemTypes.getIcon(gemTypes.getNumber(gem.name)), width: 50, height: 50}, description: gem.getDescription()});
                    //line above is moved to the itemManager because it needs to wait for server response => TODO: change createGem to a promise, is it worth the trouble though?
                }]);
            }
            params.withTimer = true;
            // Get difference in seconds
            const timeDiff = (timeEnd - this.currentTime)/1000;
            model.timeToBuild = timeDiff;
        }
        if(params.withTimer){
            // Copy asset object
            const assetClone = asset.clone();
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
                    if(params.task && params.task.type === "building_upgrade_task") this.#checkIfBuildingHasUpgradeTask(params, model);
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

    /**
     * Verifies if the building has an upgrade task
     * @param params - parameters (with params.task.id)
     * @param model - model of the building
     */
    #checkIfBuildingHasUpgradeTask(params, model){
        // Send get request to the server to check if the model already have the correct level
        $.ajax({
            url: `${API_URL}/${buildingUpgradeURI}?id=${params.task.id}`,
            type: "GET",
            contentType: "application/json",
            success: (data) => {
                // If there is a task, we have to upgrade the building
                params.model = model;
                this.levelUpBuilding(params);
            }});
    }

    /**
     * Get the parameters of the fuse task
     * @param params - parameters (with params.task.id)
     * @param model - model of the building
     * @returns {Promise<void>} - data of the task
     */
    async #getFuseTaskParams(params, model){
        // Send get request to the server to check if the model already have the correct level
        await $.ajax({
            url: `${API_URL}/${fuseTaskURI}?id=${params.task.id}`,
            type: "GET",
            contentType: "application/json",
            success: (data) => {
                return data;
            }});
    }

    /**
     * Level up the building on server
     * @param params - parameters (with params.task.id and model)
     * @returns {Promise<void>} - data of the task
     */
    async levelUpBuilding(params){
        try{
        // Send get request to the server to check if the model already have the correct level
            const data = await $.ajax({
                url: `${API_URL}/${buildingUpgradeURI}?id=${params.task.id}`,
                type: "GET",
                contentType: "application/json",
                success: async (data) => {
                    console.log(data);
                },
                error: (xhr, status, error) => {
                    console.error(xhr.responseText);
                    console.log("Building with upgrade task id ", params.task.id, " is not found");
                }});
                let data2Send = {
                        placeable_id: params.model.id,
                        level: data.to_level
                    }
                if(params.model.dbType === "tower_building") {
                    data2Send.tower_type = "magic";
                }
                if(params.model.dbType === "prop")  return; // Skip props
                // Send put request to the server to level up the building
                await $.ajax({
                    url: `${API_URL}/${placeableURI}/${params.model.dbType}`,
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify(
                        data2Send),
                    success: (data) => {
                        params.model.level = data.level;
                        //TODO: is this always +1
                        // this.playerInfo.changeXP(150);
                        console.log(data);
                        console.log("BuiLdinung upgrrrraded");
                    },
                    error: (xhr, status, error) => {
                        console.error(xhr.responseText);
                        console.log("Building ", params.model.id, " with upgrade task id ", params.task.id, " cannot be leveled up");
                    }
                });
                // Delete the old task
                await $.ajax({
                    url: `${API_URL}/${taskURI}?id=${params.task.id}`,
                    type: "DELETE",
                    contentType: "application/json",
                    success: (data) => {
                        console.log(data);
                    },
                    error: (xhr, status, error) => {
                        console.error(xhr.responseText);
                        console.log("Task ", params.task.id, " cannot be deleted (maybe already deleted)");
                    }
                });
        }catch (e){
            console.error(e);
        }
    }

    /**
     * Creates a proxy model and view
     * @param params - parameters (buildingName, position, team, building)
     * @returns {*} - model of the proxy
     */
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
            let health = Level[params.playerLevel]["AltarHp"];
            if (params.building.team != params.yourTeam) {
                health = Level[params.opponentLevel]["AltarHp"];
            }
            model.health = health;
            model.maxHealth = health;
        }
        if (params.buildingName === "Tower") {
            const height = 33;
            view.boundingBox.set(new THREE.Vector3().copy(currentPos).sub(new THREE.Vector3(3,0,3)), new THREE.Vector3().copy(currentPos).add(new THREE.Vector3(3,height,3)));
            model.radius = Math.sqrt(3*3 + 3*3) + 0.5;
            model.health = Math.ceil(params.building.getStats().get("capacity"));
            model.maxHealth = Math.ceil(params.building.getStats().get("capacity"));


            console.log(model.health, model.maxHealth);

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
     * @param {{type: string, position: THREE.Vector3, id: number, gems: Object[] | undefined, stats: {name: string, value: number}[], task, level}[]} buildingsList list of the buildings to add
     * @throws {Error} if there is no constructor for the building
     */
    #addBuildings(islandModel, buildingsList){
        let position = new THREE.Vector3();
        buildingsList.forEach((building) => {
            try {
                position.set(building.position.x, building.position.y, building.position.z);
                convertGridIndexToWorldPosition(position);
                position.add(islandModel.position);
                islandModel.addBuilding(this.createBuilding({
                    buildingName: building.type,
                    position: position,
                    rotation: building.rotation,
                    withTimer: false,
                    id: building.id,
                    gems: building.gems,
                    stats: building.stats,
                    team: islandModel.team,
                    task: building.task,
                    level: building.level
                }));
            } catch (e){
                console.error(`no ctor for ${building.type} building: ${e.message}`);
            }
        });
    }
}