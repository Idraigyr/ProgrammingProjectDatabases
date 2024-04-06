import WebGL from "three-WebGL";
import * as THREE from "three";
import {Controller} from "./Controller/Controller.js";
import {cameraPosition, physicsSteps} from "./configs/ControllerConfigs.js";
import {CharacterController} from "./Controller/CharacterController.js";
import {Factory} from "./Controller/Factory.js";
import {SpellFactory} from "./Controller/SpellFactory.js";
import {HUD} from "./Controller/HUD.js"
import {acceleratedRaycast} from "three-mesh-bvh";
import {View} from "./View/ViewNamespace.js";
import {interactKey, subSpellKey} from "./configs/Keybinds.js";
import {gridCellSize} from "./configs/ViewConfigs.js";
import {OrbitControls} from "three-orbitControls";
import {buildTypes} from "./configs/Enums.js";

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
        this.scene.background = new THREE.Color( 0x87CEEB ); // add sky
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

        this.playerInfo = new Controller.UserInfo();

        this.itemManager = new Controller.ItemManager();
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
            raycaster: this.raycastController
        });
        this.cameraManager.camera.position.set(0,0,0);
        this.cameraManager.camera.lookAt(0,0,0);

        this.timerManager = new Controller.TimerManager();
        this.playerController = null;
        this.spellCaster = new Controller.SpellCaster({userInfo: this.playerInfo, raycaster: this.raycastController, viewManager: this.viewManager});
        this.minionControllers = [];
        this.assetManager = new Controller.AssetManager();
        this.hud = new HUD(this.inputManager)
        this.menuManager = new Controller.MenuManager({container: document.querySelector("#menuContainer"), blockInputCallback: {
                block: this.inputManager.exitPointerLock.bind(this.inputManager),
                activate: this.inputManager.requestPointerLock.bind(this.inputManager)
        }});


        this.factory = new Factory({scene: this.scene, viewManager: this.viewManager, assetManager: this.assetManager, timerManager: this.timerManager});
        this.spellFactory = new SpellFactory({scene: this.scene, viewManager: this.viewManager, assetManager: this.assetManager, camera: this.cameraManager.camera});
        this.BuildManager = new Controller.BuildManager(this.raycastController, this.scene);

        this.playerInfo.addEventListener("updateCrystals", this.hud.updateCrystals.bind(this.hud));
        this.playerInfo.addEventListener("updateXp", this.hud.updateXP.bind(this.hud));
        this.playerInfo.addEventListener("updateLevel", this.hud.updateLevel.bind(this.hud));

        this.inputManager.addMouseDownListener(this.spellCaster.onLeftClickDown.bind(this.spellCaster), "left");
        this.inputManager.addKeyDownEventListener(interactKey, this.spellCaster.interact.bind(this.spellCaster));
        // this.inputManager.addKeyDownEventListener(subSpellKey, this.spellCaster.activateSubSpell.bind(this.spellCaster));
        this.inputManager.addEventListener("spellSlotChange", this.spellCaster.onSpellSwitch.bind(this.spellCaster));

        this.menuManager.addEventListener("addGem", this.itemManager.addGem.bind(this.itemManager));
        this.menuManager.addEventListener("removeGem", this.itemManager.removeGem.bind(this.itemManager));

        this.spellCaster.addEventListener("createSpellEntity", this.spellFactory.createSpell.bind(this.spellFactory));
        this.spellCaster.addEventListener("updateBuildSpell", this.BuildManager.updateBuildSpell.bind(this.BuildManager));
        //TODO: change nameless callbacks to methods of a class?
        this.spellCaster.addEventListener("castBuildSpell", (event) => {
            const buildingNumber = this.worldManager.checkPosForBuilding(event.detail.params.position);
            if(buildingNumber === buildTypes.getNumber("void")) return;
            if (buildingNumber === buildTypes.getNumber("empty")) {
                //temp solution:
                this.worldManager.currentPos = event.detail.params.position;
                this.menuManager.renderMenu({name: buildTypes.getMenuName(buildingNumber)});
                this.inputManager.exitPointerLock();
            } else {
                //TODO: logic for moving the building.
            }
        });
        this.spellCaster.addEventListener("interact", (event) => {
            // this.hud.openMenu(this.worldManager.checkPosForBuilding(event.detail.position));
            const buildingNumber = this.worldManager.checkPosForBuilding(event.detail.position);
            const items = []; //TODO: fill with equipped gems of selected building if applicable
            console.log(buildTypes.getMenuName(buildingNumber));
            this.menuManager.renderMenu({name: buildTypes.getMenuName(buildingNumber), items: items});
            //temp solution:
            this.worldManager.currentPos = event.detail.position;
        });
        this.spellCaster.addEventListener("visibleSpellPreview", this.viewManager.spellPreview.makeVisible.bind(this.viewManager.spellPreview));
        this.spellCaster.addEventListener("RenderSpellPreview", this.viewManager.renderSpellPreview.bind(this.viewManager));


        document.addEventListener("visibilitychange", this.onVisibilityChange.bind(this));
        window.addEventListener("resize", this.onResize.bind(this));

        //visualise camera line -- DEBUG STATEMENTS --
        // this.inputManager.addKeyDownEventListener("KeyN",() => {
        //     console.log("N");
        //     this.scene.add(this.cameraManager.collisionLine);
        // });
        //visualise camera line -- DEBUG STATEMENTS --
    }

    onResize(){
        this.cameraManager.camera.aspect = window.innerWidth / window.innerHeight;
        this.cameraManager.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    onVisibilityChange(){
        if(document.visibilityState === "visible"){
            this.simulatePhysics = true;
            this.clock.getDelta();
        } else {
            this.simulatePhysics = false;
        }
        // let playerData = {"level": 1}; //TODO: fill with method from
        // let islandData = {}; //TODO: fill with method from worldManager
        // navigator.sendBeacon(`${API_URL}/${playerURI}`, JSON.stringify(playerData));
    }

    /**
     * Adds a new minionController to the list of minionControllers
     * @param controller - the controller to add
     */
    addMinionController(controller){
        this.minionControllers.push(controller);
    }

    /**
     * Removes a minionController from the list of minionControllers
     * @param controller - the controller to remove
     */
    removeMinionController(controller){
        this.minionControllers.filter((c) => controller !== c);
    }

    /**
     * Loads the assets, creates the worldManager, the playerController and sets the cameraManager target to the player
     * @returns {Promise<void>} - a promise that resolves when the assets are loaded
     */
    async loadAssets(){
        const progressBar = document.getElementById('progress-bar');
        //TODO: try to remove awaits? what can we complete in parallel?
        progressBar.labels[0].innerText = "retrieving user info...";
        await this.playerInfo.retrieveInfo();
        progressBar.value = 10;
        progressBar.labels[0].innerText = "loading assets...";
        await this.assetManager.loadViews();
        this.menuManager.createMenus();
        //TODO: create menuItems for loaded in items, buildings that can be placed and all spells (unlocked and locked)
        progressBar.labels[0].innerText = "loading world...";
        this.worldManager = new Controller.WorldManager({factory: this.factory, spellFactory: this.spellFactory, collisionDetector: this.collisionDetector, userInfo: this.playerInfo});
        await this.worldManager.importWorld(this.playerInfo.islandID);
        progressBar.value = 90;
        progressBar.labels[0].innerText = "generating collision mesh...";
        this.collisionDetector.generateColliderOnWorker();
        progressBar.value = 100;
        this.playerController = new CharacterController({
            Character: this.worldManager.world.player,
            InputManager: this.inputManager,
            collisionDetector: this.collisionDetector
        });
        this.inputManager.addMouseMoveListener(this.playerController.updateRotation.bind(this.playerController));
        this.cameraManager.target = this.worldManager.world.player;
        // Crete event to show that the assets are 100% loaded
        // document.dispatchEvent(new Event("assetsLoaded"));
        this.spellCaster.wizard = this.worldManager.world.player;

        // this.worldManager.world.player.addEventListener("updateRotation", this.viewManager.spellPreview.updateRotation.bind(this.viewManager.spellPreview));
        this.playerController.addEventListener("eatingEvent", this.worldManager.updatePlayerStats.bind(this.worldManager));
        this.worldManager.world.player.addEventListener("updateHealth", this.hud.updateHealthBar.bind(this.hud));
        this.worldManager.world.player.addEventListener("updateMana", this.hud.updateManaBar.bind(this.hud));

        this.menuManager.addEventListener("build", (event) => {
            this.menuManager.hideMenu();
            console.log(event);
            //TODO: make sure that id of BuildingItem (=MenuItem) corresponds to the ctor name of the building
            const ctorName = event.detail.id;
            this.worldManager.placeBuilding({detail: {buildingName: ctorName, position: this.worldManager.currentPos, withTimer: true}});
        }); //build building with event.detail.id on selected Position;
        this.worldManager.world.player.advertiseCurrentCondition();
    }

    /**
     * Starts the game loop
     */
    start(){
        if ( WebGL.isWebGLAvailable()) {
            document.querySelector('.loading-animation').style.display = 'none';
            //init();
            this.simulatePhysics = true;
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

        this.minionControllers.forEach((controller) => controller.update(this.deltaTime));

        this.playerController.update(this.deltaTime);
        if(this.simulatePhysics){
            for(let i = 0; i < physicsSteps; i++){
                this.worldManager.world.update(this.deltaTime/physicsSteps);
                this.playerController.updatePhysics(this.deltaTime/physicsSteps);
            }
        }
        this.timerManager.update(this.deltaTime);
        this.cameraManager.update(this.deltaTime);
        //...
        this.viewManager.updateAnimatedViews(this.deltaTime);

        this.renderer.render( this.scene, this.cameraManager.camera );
        //OrbitControls -- DEBUG STATEMENTS --
        // this.renderer.render( this.scene, orbitCam );
        //OrbitControls -- DEBUG STATEMENTS --
        // this.BuildManager.makePreviewObjectInvisible();
    }
}

let app = new App({});
await app.loadAssets();
app.start();