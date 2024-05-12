import WebGL from "three-WebGL";
import * as THREE from "three";
import {Controller} from "./Controller/Controller.js";
import {cameraPosition, fusionTime, physicsSteps} from "./configs/ControllerConfigs.js";
import {CharacterController} from "./Controller/CharacterController.js";
import {Factory} from "./Controller/Factory.js";
import {SpellFactory} from "./Controller/SpellFactory.js";
import {HUD} from "./Controller/HUD.js"
import "./external/socketio.js"
import "./external/chatBox.js"
import "./external/LevelUp.js"
import "./external/friendsMenu.js"
import {OrbitControls} from "three-orbitControls";
import {
    placeableURI,
    postRetries,
} from "./configs/EndpointConfigs.js";
import {acceleratedRaycast} from "three-mesh-bvh";
import {View} from "./View/ViewNamespace.js";
import {eatingKey, interactKey} from "./configs/Keybinds.js";
import {gridCellSize} from "./configs/ViewConfigs.js";
import {buildTypes, gemTypes} from "./configs/Enums.js";
import {ChatNamespace} from "./external/socketio.js";
import {ForwardingNameSpace} from "./Controller/ForwardingNameSpace.js";
import {Settings} from "./Menus/settings.js";
import {Cursor} from "./Controller/Cursor.js";

THREE.Mesh.prototype.raycast = acceleratedRaycast;
const canvas = document.getElementById("canvas");

//OrbitControls -- DEBUG STATEMENTS --
// let orbitCam = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
// orbitCam.position.set(50,20,50);
// orbitCam.lookAt(0,0,0);
// let orbitControls = null;
//OrbitControls -- DEBUG STATEMENTS --

/**
 * Main class of the game
 */
class App {
    /**
     * Create the app. Setups clock, scene, renderer, deltaTime, blockedInput, viewManager, raycastController,
     * inputManager, cameraManager, playerController, minionControllers, assetManager, factory, spellFactory,
     * BuildManager and adds a pointerlock event listener
     * @param {object} params
     */
    constructor(params) {
        this.simulatePhysics = false;
        this.clock = new THREE.Clock();

        this.scene = new THREE.Scene();
        const texture = new THREE.TextureLoader().load( "../static/assets/images/background-landing.jpg" );
        this.scene.background = texture; // add sky
        this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true}); // improve quality of the picture at the cost of performance

        //OrbitControls -- DEBUG STATEMENTS --
        // orbitControls = new OrbitControls( orbitCam, this.renderer.domElement );
        // orbitControls.target.set(0,0,0);
        //
        // document.addEventListener("keydown", async (e) => {
        //     if(!app.blockedInput) return;
        //     if(e.code === "KeyU"){
        //         await canvas.requestPointerLock();
        //     }
        // });
        //OrbitControls -- DEBUG STATEMENTS --

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio(window.devicePixelRatio); // improve picture quality
        this.deltaTime = 0; // time between updates in seconds
        this.blockedInput = true;

        this.playerInfo = new Controller.PlayerInfo();

        this.viewManager = new Controller.ViewManager({spellPreview: new View.SpellPreview([{key: "build", details: {
            ctor: THREE.BoxGeometry,
            params: [gridCellSize,10,gridCellSize],
            primaryColor: 0xD46D01,
            secondaryColor: 0xFFB23D,
            cutoff: -5,
            rotate: false
        }},
        {key: "augmentBuild", details: {
            ctor: THREE.BoxGeometry,
            params: [gridCellSize,10,gridCellSize],
            primaryColor: 0x0000CC,
            secondaryColor: 0x0000FF,
            cutoff: -5,
            rotate: false
        }},
        {key: "thundercloud", details: {
            ctor: THREE.CylinderGeometry,
            params: [3, 3, 3], //TODO: spellSize here
            primaryColor: 0x0051FF,
            secondaryColor: 0xCCABFF,
            cutoff: -1.499,
            rotate: false
        }},
        {key: "icewall", details: {
            ctor: THREE.BoxGeometry,
            params: [10,3,3], //TODO: spellSize here
            primaryColor: 0x0033FF,
            secondaryColor: 0xB5FFFF,
            cutoff: -1.499,
            rotate: true,
            horizontalRotation: 90,
        }}])});

        this.scene.add(this.viewManager.spellPreview.charModel);
        this.scene.add(this.viewManager.spellPreview.boxHelper);

        this.collisionDetector = new Controller.CollisionDetector({scene: this.scene, viewManager: this.viewManager});
        this.raycastController = new Controller.RaycastController({viewManager: this.viewManager, collisionDetector: this.collisionDetector});
        this.inputManager = new Controller.InputManager({canvas: canvas});
        this.cameraManager = new Controller.CameraManager({
            camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
            offset: new THREE.Vector3(cameraPosition.offset.x,cameraPosition.offset.y,cameraPosition.offset.z),
            lookAt: new THREE.Vector3(cameraPosition.lookAt.x,cameraPosition.lookAt.y,cameraPosition.lookAt.z),
            target: null,
            raycaster: this.raycastController,
            //visualise axes -- DEBUG STATEMENTS --
            // axisHelper: new Cursor({})
            //visualise axes -- DEBUG STATEMENTS --
        });
        this.cameraManager.camera.position.set(0,0,0);
        this.cameraManager.camera.lookAt(0,0,0);

        //visualise axes -- DEBUG STATEMENTS --
        // this.scene.add(this.cameraManager.axisHelper.charModel);
        //visualise axes -- DEBUG STATEMENTS --

        this.multiplayerController = new Controller.MultiplayerController({togglePhysicsUpdates: this.togglePhysicsUpdates.bind(this)});

        this.timerManager = new Controller.TimerManager();
        this.playerController = null;
        this.spellCaster = new Controller.SpellCaster({playerInfo: this.playerInfo, raycaster: this.raycastController, viewManager: this.viewManager, camera: this.cameraManager.camera});
        this.minionController = new Controller.MinionController({collisionDetector: this.collisionDetector});
        this.assetManager = new Controller.AssetManager();
        this.hud = new HUD(this.inputManager)
        this.settings = new Settings(this.inputManager, this.playerInfo)
        this.menuManager = new Controller.MenuManager({
            container: document.querySelector("#menuContainer"),
            blockInputCallback: {
                block: this.inputManager.exitPointerLock.bind(this.inputManager),
                activate: this.inputManager.requestPointerLock.bind(this.inputManager)
            },
            matchMakeCallback: this.multiplayerController.toggleMatchMaking.bind(this.multiplayerController)
        });
        this.itemManager = new Controller.ItemManager({playerInfo: this.playerInfo, menuManager: this.menuManager});
        this.menuManager.addCallbacks({
            checkStakesCallback: this.itemManager.stakeGems.bind(this.itemManager),
            matchMakeCallback: this.multiplayerController.toggleMatchMaking.bind(this.multiplayerController),
        });


        this.factory = new Factory({scene: this.scene, viewManager: this.viewManager, assetManager: this.assetManager, timerManager: this.timerManager, collisionDetector: this.collisionDetector, camera: this.cameraManager.camera, playerInfo: this.playerInfo});
        this.spellFactory = new SpellFactory({scene: this.scene, viewManager: this.viewManager, assetManager: this.assetManager, camera: this.cameraManager.camera});
        this.BuildManager = new Controller.BuildManager(this.raycastController, this.scene);

        // Setup chat SocketIO namespace
        this.chatNameSpace = new ChatNamespace(this);
        this.forwardingNameSpace = new ForwardingNameSpace();

        this.multiplayerController.addEventListener("toggleMatchMaking", this.menuManager.toggleMatchMaking.bind(this.menuManager));

        this.playerInfo.addEventListener("updateCrystals", this.hud.updateCrystals.bind(this.hud));
        this.playerInfo.addEventListener("updateXp", this.hud.updateXP.bind(this.hud));
        this.playerInfo.addEventListener("updateXpThreshold", this.hud.updateXPThreshold.bind(this.hud));
        this.playerInfo.addEventListener("updateLevel", this.hud.updateLevel.bind(this.hud));
        this.playerInfo.addEventListener("updateUsername", this.hud.updateUsername.bind(this.hud));


        this.inputManager.addMouseDownListener(this.spellCaster.onLeftClickDown.bind(this.spellCaster), "left");
        this.inputManager.addMouseDownListener(this.spellCaster.onRightClickDown.bind(this.spellCaster), "right");
        this.inputManager.addKeyDownEventListener(interactKey, this.spellCaster.interact.bind(this.spellCaster));
        // this.inputManager.addKeyDownEventListener(subSpellKey, this.spellCaster.activateSubSpell.bind(this.spellCaster));
        this.inputManager.addEventListener("spellSlotChange", this.spellCaster.onSpellSwitch.bind(this.spellCaster));


        this.menuManager.addEventListener("startFusion", (event) => {
            const fusionLevel = this.worldManager.world.getBuildingByPosition(this.worldManager.currentPos).level;
            this.timerManager.createTimer(fusionTime, [() => {
                const gem = this.itemManager.createGem(fusionLevel);
                // this.menuManager.addItem({item: gem, icon: {src: gemTypes.getIcon(gemTypes.getNumber(gem.name)), width: 50, height: 50}, description: gem.getDescription()});
                //line above is moved to the itemManager because it needs to wait for server response => TODO: change createGem to a promise, is it worth the trouble though?
            }]);
        });
        this.menuManager.addEventListener("addGem", (event) => {
            event.detail.building = this.worldManager.world.getBuildingByPosition(this.worldManager.currentPos);
            this.itemManager.addGem(event);
            this.menuManager.updateMenu({name: buildTypes.getMenuNameFromCtorName(event.detail.building.constructor.name), stats: event.detail.building.getStats()});
        });
        this.menuManager.addEventListener("removeGem", (event) => {
            event.detail.building = this.worldManager.world.getBuildingByPosition(this.worldManager.currentPos);
            this.itemManager.removeGem(event);
            this.menuManager.updateMenu({name: buildTypes.getMenuNameFromCtorName(event.detail.building.constructor.name), stats: event.detail.building.getStats()});
        });
        this.menuManager.addEventListener("lvlUp", (event) => {
            const building = this.worldManager.world.getBuildingByPosition(this.worldManager.currentPos);
            if(this.playerInfo.crystals < building?.upgradeCost) return;
            this.playerInfo.changeCrystals(-building.upgradeCost);
            // building.levelUp(); TODO: implement levelUp method
        });

        this.spellCaster.addEventListener("createSpellEntity", this.spellFactory.createSpell.bind(this.spellFactory));
        this.spellCaster.addEventListener("updateBuildSpell", this.BuildManager.updateBuildSpell.bind(this.BuildManager));
        // Onclick event
        //TODO: change nameless callbacks to methods of a class?
        this.spellCaster.addEventListener("castBuildSpell", (event) => { //TODO: rename this to MoveBuilding or something and put this in worldManager
            const buildingNumber = this.worldManager.checkPosForBuilding(event.detail.params.position);
            if(buildingNumber === buildTypes.getNumber("void")) return;
            // Skip altar
            if(buildingNumber === buildTypes.getNumber("altar_building")) return;
            // If the selected cell is empty
            if ((buildingNumber === buildTypes.getNumber("empty") && this.spellCaster.currentObject)) { //move object
                // If there is an object selected, drop it
                // TODO: more advanced
                // Get selected building
                const building = this.spellCaster.currentObject;
                // Update bounding box of the building
                building.dispatchEvent(new CustomEvent("updateBoundingBox")); //TODO: put this in a method of the building's class
                // Update occupied cells
                const pos = event.detail.params.position;
                const island = this.worldManager.world.getIslandByPosition(pos);
                island.freeCell(this.spellCaster.previousSelectedPosition); // Make the previous cell empty
                // Occupy cell
                building.cellIndex = island.occupyCell(pos, building.dbType);
                // Remove the object from spellCaster
                this.spellCaster.currentObject.ready = true;
                this.spellCaster.currentObject = null;
                this.spellCaster.previousRotation = null;
                //TODO @Daria: shouldn't this: " this.spellCaster.previousSelectedPosition = null; " be here?
                // Update static mesh
                this.collisionDetector.generateColliderOnWorker();
                // Send put request to the server if persistence = true
                if(this.worldManager.persistent){
                    this.worldManager.sendPUT(placeableURI, building, postRetries);
                }

                //allow menus to be opened again
                this.menuManager.menusEnabled = true;

            } else if(buildingNumber === buildTypes.getNumber("empty")){ //open buildmenu
                this.worldManager.currentPos = event.detail.params.position;
                this.worldManager.currentRotation = event.detail.params.rotation;
                let buildings = [];
                for(const building in this.playerInfo.buildingsPlaced){
                    buildings.push({
                        building: building,
                        placed: this.playerInfo.buildingsPlaced[building],
                        total: this.playerInfo.buildingsThreshold[building]
                    });
                }
                this.menuManager.renderMenu({name: buildTypes.getMenuName(buildingNumber), buildings: buildings});
                this.inputManager.exitPointerLock();

            } else if (this.spellCaster.currentObject) { //What is this code block used for??? placing back in same spot after rotating?
                // Get selected building
                const building = this.spellCaster.currentObject;
                // Update bounding box of the building
                building.dispatchEvent(new CustomEvent("updateBoundingBox"));
                // Update occupied cells
                const pos = event.detail.params.position;
                const island = this.worldManager.world.getIslandByPosition(pos);
                // Update static mesh
                this.collisionDetector.generateColliderOnWorker();
                // Get if the cell is occupied
                let buildOnCell = island.getCellIndex(pos);
                if (buildOnCell !== building.cellIndex) return;
                // Send put request to the server if persistence = true
                if(this.worldManager.persistent){
                    this.worldManager.sendPUT(placeableURI, building, postRetries);
                }
                // You have placed the same building on the same cell, so remove info from spellCaster
                this.spellCaster.currentObject.ready = true;
                this.spellCaster.currentObject = null;
                this.spellCaster.previousRotation = null;
                this.spellCaster.previousSelectedPosition = null;

                //allow menus to be opened again
                this.menuManager.menusEnabled = true;

            } else { //select object
                /* Logic for selecting a building */
                // There is already object
                if(this.spellCaster.currentObject) return;
                let selectedObject =  this.worldManager.world.getBuildingByPosition(event.detail.params.position);
                // If no object selected or the object is not ready, return
                if (!selectedObject || !selectedObject.ready) return;
                // Select current object
                this.spellCaster.currentObject = selectedObject;
                this.spellCaster.currentObject.ready = false;

                //disable opening menus while building is selected
                this.menuManager.menusEnabled = false;
            }
        });
        this.spellCaster.addEventListener("interact", async (event) => {
            this.togglePhysicsUpdates(false);
            // Check if the building is ready
            const building = this.worldManager.world.getBuildingByPosition(event.detail.position);
            if (building && !building.ready) return;
            const buildingNumber = this.worldManager.checkPosForBuilding(event.detail.position);

            let params = {name: buildTypes.getMenuName(buildingNumber)}

            if(buildingNumber === buildTypes.getNumber("empty")){
                params.buildings = [];
                for(const building in this.playerInfo.buildingsPlaced){
                    params.buildings.push({
                        building: building,
                        placed: this.playerInfo.buildingsPlaced[building],
                        total: this.playerInfo.buildingsThreshold[building]
                    });
                }
            }

            //TODO: move if statements into their own method of the placeable class' subclasses
            if(building && building.gemSlots > 0){
                params.gemIds = this.itemManager.getItemIdsForBuilding(building.id);
                params.stats = building.getStats();
                params.level = building.level;
                // params.maxLevel = building.maxLevel; //TODO: implement maxLevel?
                params.slots = building.gemSlots;
                console.log("rendering slots: ", params.slots);
            }

            if(building?.upgradable){
                params.currentLevel = building.level;
                params.newLevel = building.maxLevel > building.level ? building.level + 1 : building.level;
                params.upgradeCost = building.upgradeCost;
                params.upgradeTime = building.upgradeTime;
            }

            //if the building is a mine, forward stored crystal information
            if(buildingNumber === buildTypes.getNumber("mine_building")){
                const currentTime = new Date(await this.playerInfo.getCurrentTime());
                params.crystals = building.checkStoredCrystals(currentTime);
                params.maxCrystals = building.maxCrystals;
                params.rate = building.productionRate;

                // params.maxCrystals = params.stats.get("capacity");
                // params.rate = params.stats.get("mineSpeed");
            }
            if(buildingNumber === buildTypes.getNumber("tower_building")){
                // tower stats for Lucas
                // gets called on menu open
                // default values: hp: 100, damage: 20, attackSpeed: 1
                console.log("Tower id: " + building.id + " hp: " + params.stats["hp"] +
                    " damage: " + params.stats["damage"] + " attack speed: " + params.stats["attackSpeed"]);
            }
            this.menuManager.renderMenu(params);
            //temp solution:
            this.worldManager.currentPos = event.detail.position;
            this.worldManager.currentRotation = event.detail.rotation;
            this.togglePhysicsUpdates(true);
        });
        this.spellCaster.addEventListener("visibleSpellPreview", this.viewManager.spellPreview.toggleVisibility.bind(this.viewManager.spellPreview));
        this.spellCaster.addEventListener("RenderSpellPreview", this.viewManager.renderSpellPreview.bind(this.viewManager));

        document.addEventListener("visibilitychange", this.onVisibilityChange.bind(this));
        window.addEventListener("resize", this.onResize.bind(this));

        this.chatNameSpace.registerHandlers();
        this.forwardingNameSpace.registerHandlers({
            handleMatchFound: this.multiplayerController.loadMatch.bind(this.multiplayerController),
            handleMatchStart: this.multiplayerController.startMatch.bind(this.multiplayerController),
            handleMatchEnd: this.multiplayerController.endMatch.bind(this.multiplayerController),
            handleMatchAbort: this.multiplayerController.abortMatch.bind(this.multiplayerController),
            processReceivedState: this.multiplayerController.processReceivedState.bind(this.multiplayerController),
            updateMatchTimer: this.multiplayerController.updateMatchTimer.bind(this.multiplayerController),
        });

        //visualise camera line -- DEBUG STATEMENTS --
        // this.inputManager.addKeyDownEventListener("KeyN",() => {
        //     console.log("N");
        //     this.scene.add(this.cameraManager.collisionLine);
        // });
        //visualise camera line -- DEBUG STATEMENTS --
    }

    createRandomGem(){

    }

    /**
     * Updates the camera aspect ratio and the renderer size when the window is resized
     */
    onResize(){
        this.cameraManager.camera.aspect = window.innerWidth / window.innerHeight;
        this.cameraManager.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        // Scale the background image
        if(!this.scene.background) return;
        const targetAspect = window.innerWidth / window.innerHeight;
        const imageAspect = 1920 / 1280;
        const factor = imageAspect / targetAspect;
        // When factor larger than 1, that means texture 'wilder' than target。
        // we should scale texture height to target height and then 'map' the center  of texture to target， and vice versa.
        this.scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
        this.scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
        this.scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;
        this.scene.background.repeat.y = factor > 1 ? 1 : factor;
    }

    /**
     * Pauses the physics simulation when the tab is not visible
     */
    async onVisibilityChange(){
        if(document.visibilityState === "visible"){
            this.togglePhysicsUpdates(true);
            if(this.playerInfo.isPlayerLoggedIn()) await this.playerInfo.login();
        } else {
            this.simulatePhysics = false;
            if(this.playerInfo.isPlayerLoggedIn()) await this.playerInfo.logout();
            if(this.multiplayerController.matchmaking) this.multiplayerController.toggleMatchMaking();
            if(this.menuManager.currentMenu === "AltarMenu") this.menuManager.exitMenu();
            this.togglePhysicsUpdates(false);
        }
        // let playerData = {"level": 1}; //TODO: fill with method from
        // let islandData = {}; //TODO: fill with method from worldManager
        // navigator.sendBeacon(`${API_URL}/${playerURI}`, JSON.stringify(playerData));
    }

    /**
     * Toggles the physics simulation
     * @param {boolean | null} bool - optional parameter to toggle on (true) or off (false)
     */
    togglePhysicsUpdates(bool = null){
        this.simulatePhysics = bool ?? !this.simulatePhysics;
        if(this.simulatePhysics) this.clock.getDelta();
    }

    /**
     * Loads the assets, creates the worldManager, the playerController and sets the cameraManager target to the player
     * @returns {Promise<void>} - a promise that resolves when the assets are loaded
     */
    async loadAssets(){
        console.log( await this.playerInfo.getCurrentTime());
        const progressBar = document.getElementById('progress-bar');
        //TODO: try to remove awaits? what can we complete in parallel?
        progressBar.labels[0].innerText = "retrieving user info...";
        await this.playerInfo.retrieveInfo();
        progressBar.value = 10;
        progressBar.labels[0].innerText = "loading assets...";
        this.settings.loadCursors();
        await this.assetManager.loadViews();
        // Load info for building menu. May be extended to other menus
        await this.menuManager.fetchInfoFromDatabase();
        await this.itemManager.retrieveGemAttributes();
        this.itemManager.createGemModels(this.playerInfo.gems);
        this.menuManager.createMenus();
        this.menuManager.addItems(this.itemManager.getGemsViewParams());
        progressBar.value = 80;
        //TODO: create menuItems for loaded in items, buildings that can be placed and all spells (unlocked and locked)
        progressBar.labels[0].innerText = "loading world...";
        this.worldManager = new Controller.WorldManager({factory: this.factory, spellFactory: this.spellFactory, collisionDetector: this.collisionDetector, playerInfo: this.playerInfo, itemManager: this.itemManager});
        await this.worldManager.importWorld(this.playerInfo.islandID);
        this.worldManager.world.player.setId({entity: {player_id: this.playerInfo.userID}});
        progressBar.value = 90;
        progressBar.labels[0].innerText = "generating collision mesh...";
        this.collisionDetector.generateColliderOnWorker();

        progressBar.value = 95;
        this.playerController = new CharacterController({
            Character: this.worldManager.world.player,
            InputManager: this.inputManager,
            collisionDetector: this.collisionDetector
        });
        progressBar.labels[0].innerText = "last touches...";
        this.playerInfo.login();
        progressBar.value = 100;
        this.inputManager.addMouseMoveListener(this.playerController.updateRotation.bind(this.playerController));
        this.cameraManager.target = this.worldManager.world.player;
        // Crete event to show that the assets are 100% loaded
        // document.dispatchEvent(new Event("assetsLoaded"));
        this.spellCaster.wizard = this.worldManager.world.player;

        // this.worldManager.world.player.addEventListener("updateRotation", this.viewManager.spellPreview.updateRotation.bind(this.viewManager.spellPreview));
        this.inputManager.addKeyDownEventListener(eatingKey, this.playerController.eat.bind(this.playerController));
        this.playerController.addEventListener("eatingEvent", this.worldManager.updatePlayerStats.bind(this.worldManager));
        this.worldManager.world.player.addEventListener("updateHealth", this.hud.updateHealthBar.bind(this.hud));
        this.worldManager.world.player.addEventListener("updateMana", this.hud.updateManaBar.bind(this.hud));
        this.worldManager.world.player.addEventListener("updateMana", this.playerInfo.updateMana.bind(this.playerInfo));
        this.worldManager.world.player.addEventListener("updateCooldowns", this.hud.updateCooldowns.bind(this.hud));
        this.worldManager.world.player.addEventListener("updatePosition", this.playerInfo.updatePlayerPosition.bind(this.playerInfo)); //TODO: do this only once on visibility change
        this.inputManager.addKeyDownEventListener(eatingKey, this.playerController.eat.bind(this.playerController));


        this.menuManager.addEventListener("collect", this.worldManager.collectCrystals.bind(this.worldManager));
        this.menuManager.addEventListener("add", this.worldManager.addCrystals.bind(this.worldManager));
        this.menuManager.addEventListener("remove", this.worldManager.removeCrystals.bind(this.worldManager));

        this.menuManager.addEventListener("build", (event) => {
            //TODO: make sure that id of BuildingItem (=MenuItem) corresponds to the ctor name of the building
            const ctorName = event.detail.id;
            // TODO: move things from menuManager, because otherwise you have to use the following code:
            // Get the price of the building
            let nameInDB = this.menuManager.ctorToDBName(ctorName);
            const price = this.menuManager.infoFromDatabase["buildings"]?.find((building) => building.name === nameInDB)?.cost;
            // Check if you have enough mana
            const mana = this.playerInfo.mana;
            this.worldManager.world.player.cooldownSpell();
            const mana2 = this.playerInfo.mana;
            if (mana === mana2 || mana2 < 0) {
                console.log("Not enough mana");
                this.worldManager.world.player.mana = mana;
                this.playerInfo.mana = mana;
                this.hud.updateManaBar({detail: {current: this.playerInfo.mana, total: this.playerInfo.maxMana}});
                console.log("mana: " + this.playerInfo.mana, "Hud: " + this.hud.manaBar.textContent);
                return;
            }
            // Check if the player has enough crystals
            if(this.playerInfo.crystals < price) {
                console.log("Not enough crystals");
                return;
            } // TODO: show message
            else {
                // Subtract the price from the player's crystals
                if(this.worldManager.placeBuilding({detail: {buildingName: ctorName, position: this.worldManager.currentPos, rotation: this.worldManager.currentRotation, withTimer: true}})){
                    this.playerInfo.changeCrystals(-price) ;
                }
                this.menuManager.exitMenu();
            }

        }); //build building with event.detail.id on selected Position;
        this.playerInfo.addEventListener("updateMaxManaAndHealth", this.worldManager.world.player.updateMaxManaAndHealth.bind(this.worldManager.world.player));
        this.playerInfo.setLevelStats();
        this.worldManager.world.player.advertiseCurrentCondition();
        //TODO: is there a better way to do this?
        this.multiplayerController.setUpProperties({
            playerInfo: this.playerInfo,
            menuManager: this.menuManager,
            worldManager: this.worldManager,
            spellCaster: this.spellCaster,
            minionController: this.minionController,
            forwardingNameSpace: this.forwardingNameSpace,
            collisionDetector: this.collisionDetector,
            spellFactory: this.spellFactory,
            factory: this.factory,
            itemManager: this.itemManager,
        });

        progressBar.labels[0].innerText = "Last touches...";
        await this.playerInfo.login();

        // this.menuManager.renderMenu({name: "AltarMenu"});
        // this.menuManager.exitMenu();
    }

    initScene(){
        const group = new THREE.Group();
        const light = new THREE.AmbientLight( 0xFFFFFF, 2);
        light.position.set(0,3, 10);
        light.castShadow = true;
        group.add(light);

        const dirLight = new THREE.DirectionalLight( 0xFFFFFF, 10);
        dirLight.position.set(0,100, 50);
        dirLight.castShadow = true;
        group.add(dirLight);
        this.scene.add(group);
    }

    /**
     * Starts the game loop
     */
    start(){
        if ( WebGL.isWebGLAvailable()) {
            //TODO: remove this is test //
            // this.worldManager.addSpawningIsland();
            // this.minionController.worldMap = this.worldManager.world.islands;
            // this.worldManager.world.spawners["minions"][0].addEventListener("spawn", (event) => {
            //    this.minionController.addMinion(this.factory.createMinion(event.detail));
            // });
            //TODO: remove this is test //

            this.initScene();


            document.querySelector('.loading-animation').style.display = 'none';
            this.togglePhysicsUpdates(true);
            this.update();
        } else {
            const warning = WebGL.getWebGLErrorMessage();
            document.getElementById( 'container' ).appendChild( warning );
        }
    }

    /**
     * Updates the game loop
     */
    update(){
        requestAnimationFrame(() => {
            this.update();
        });

        this.deltaTime = this.clock.getDelta();

        this.spellCaster.update(this.deltaTime);

        this.minionController.update(this.deltaTime);
        this.playerController.update(this.deltaTime);
        if(this.simulatePhysics){
            for(let i = 0; i < physicsSteps; i++){
                this.worldManager.world.update(this.deltaTime/physicsSteps);
                this.minionController.updatePhysics(this.deltaTime/physicsSteps);
                this.playerController.updatePhysics(this.deltaTime/physicsSteps);
            }
        }
        this.timerManager.update(this.deltaTime);
        this.cameraManager.update(this.deltaTime);
        //...
        this.viewManager.updateAnimatedViews(this.deltaTime);

        //TODO: should only be done in multiplayer @Flynn
        this.viewManager.updateProxys(this.deltaTime);


        this.renderer.render( this.scene, this.cameraManager.camera );
        //OrbitControls -- DEBUG STATEMENTS --
        // this.renderer.render( this.scene, orbitCam );
        //OrbitControls -- DEBUG STATEMENTS --
        // this.BuildManager.makePreviewObjectInvisible();
    }
}

const app = new App({});
await app.loadAssets();
app.start();