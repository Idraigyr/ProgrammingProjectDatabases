import WebGL from "three-WebGL";
import * as THREE from "three";
import {Controller} from "./Controller/Controller.js";
import {cameraPosition} from "./configs/ControllerConfigs.js";
import {CharacterController} from "./Controller/CharacterController.js";
import {WorldManager} from "./Controller/WorldManager.js";
import {Factory} from "./Controller/Factory.js";
import {SpellFactory} from "./Controller/SpellFactory.js";
import {ViewManager} from "./Controller/ViewManager.js";
import {AssetManager} from "./Controller/AssetManager.js";
import {RaycastController} from "./Controller/RaycastController.js";
import {BuildManager} from "./Controller/BuildManager.js";
import {HUD} from "./Controller/HUD.js"
import {OrbitControls} from "three-orbitControls";
import {API_URL, islandURI, playerURI} from "./configs/EndpointConfigs.js";
import {acceleratedRaycast} from "three-mesh-bvh";
import {SpellCaster} from "./Controller/SpellCaster.js";
import {View} from "./View/ViewNamespace.js";
import {slot1Key, slot2Key, slot3Key, slot4Key, slot5Key} from "./configs/Keybinds.js";

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

        this.viewManager = new ViewManager({spellPreview: new View.PreviewObject([{key: "build", details: {
            ctor: THREE.BoxGeometry,
            params: [10,10,10],
            primaryColor: 0xD46D01,
            secondaryColor: 0xFFB23D,
            cutoff: -5
        }},
        {key: "thundercloud", details: {
            ctor: THREE.CylinderGeometry,
            params: [3, 3, 3],
            primaryColor: 0x0051FF,
            secondaryColor: 0xCCABFF,
            cutoff: -1.499
        }}])});
        this.scene.add(this.viewManager.spellPreview.charModel);
        this.collisionDetector = new Controller.CollisionDetector({scene: this.scene, viewManager: this.viewManager});
        this.raycastController = new RaycastController({viewManager: this.viewManager, collisionDetector: this.collisionDetector});
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

        this.playerController = null;
        this.spellCaster = new SpellCaster({userInfo: this.playerInfo, raycaster: this.raycastController, viewManager: this.viewManager});
        this.minionControllers = [];
        this.assetManager = new AssetManager();
        this.hud = new HUD(this.inputManager)

        this.playerInfo.addEventListener("updateCrystals", this.hud.updateCrystals.bind(this.hud));
        this.playerInfo.addEventListener("updateXp", this.hud.updateXP.bind(this.hud));
        this.playerInfo.addEventListener("updateLevel", this.hud.updateLevel.bind(this.hud));

        this.factory = new Factory({scene: this.scene, viewManager: this.viewManager, assetManager: this.assetManager});
        this.spellFactory = new SpellFactory({scene: this.scene, viewManager: this.viewManager, assetManager: this.assetManager, camera: this.cameraManager.camera});
        this.BuildManager = new BuildManager(this.raycastController, this.scene);

        document.addEventListener("visibilitychange", this.onClose.bind(this));
        this.inputManager.addMouseDownListener(this.spellCaster.onLeftClickDown.bind(this.spellCaster));
        //TODO: temporary solution; clean this up
        this.inputManager.addKeyDownEventListener(slot1Key, this.spellCaster.onSpellSwitch.bind(this.spellCaster));
        this.inputManager.addKeyDownEventListener(slot2Key, this.spellCaster.onSpellSwitch.bind(this.spellCaster));
        this.inputManager.addKeyDownEventListener(slot3Key, this.spellCaster.onSpellSwitch.bind(this.spellCaster));
        this.inputManager.addKeyDownEventListener(slot4Key, this.spellCaster.onSpellSwitch.bind(this.spellCaster));
        this.inputManager.addKeyDownEventListener(slot5Key, this.spellCaster.onSpellSwitch.bind(this.spellCaster));
        this.spellCaster.addEventListener("visibleSpellPreview", this.viewManager.spellPreview.makeVisible.bind(this.viewManager.spellPreview));
        this.spellCaster.addEventListener("RenderSpellPreview", this.viewManager.spellPreview.render.bind(this.viewManager.spellPreview));

        //visualise camera line -- DEBUG STATEMENTS --
        // this.inputManager.addKeyDownEventListener("KeyN",() => {
        //     console.log("N");
        //     this.scene.add(this.cameraManager.collisionLine);
        // });
        //visualise camera line -- DEBUG STATEMENTS --
    }

    onClose(){
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
        //TODO: try to remove awaits
        progressBar.labels[0].innerText = "retrieving user info...";
        await this.playerInfo.retrieveInfo();
        progressBar.value = 10;
        progressBar.labels[0].innerText = "loading assets...";
        await this.assetManager.loadViews();
        progressBar.labels[0].innerText = "loading world...";
        this.worldManager = new WorldManager({factory: this.factory, spellFactory: this.spellFactory, userInfo: this.playerInfo});
        await this.worldManager.importWorld(this.playerInfo.islandID);
        progressBar.value = 90;
        progressBar.labels[0].innerText = "generating collision mesh...";
        this.collisionDetector.generateCollider();
        progressBar.value = 100;
        this.playerController = new CharacterController({
            Character: this.worldManager.world.player,
            InputManager: this.inputManager,
            collisionDetector: this.collisionDetector,
        });
        this.inputManager.addMouseMoveListener(this.playerController.updateRotation.bind(this.playerController));
        this.cameraManager.target = this.worldManager.world.player;
        // Crete event to show that the assets are 100% loaded
        document.dispatchEvent(new Event("assetsLoaded"));
        this.spellCaster.wizard = this.worldManager.world.player;
        this.spellCaster.addEventListener("createSpellEntity", this.spellFactory.createSpell.bind(this.spellFactory));
        this.spellCaster.addEventListener("castSpell", this.spellFactory.createSpell.bind(this.spellFactory));
        this.spellCaster.addEventListener("updateBuildSpell", this.BuildManager.updateBuildSpell.bind(this.BuildManager));
        this.playerController.addEventListener("eatingEvent", this.worldManager.updatePlayerStats.bind(this.worldManager));
        this.worldManager.world.player.addEventListener("updateHealth", this.hud.updateHealthBar.bind(this.hud));
        this.worldManager.world.player.addEventListener("updateMana", this.hud.updateManaBar.bind(this.hud));
        this.worldManager.world.player.advertiseCurrentCondition();
    }

    /**
     * Starts the game loop
     */
    start(){
        if ( WebGL.isWebGLAvailable()) {
            document.querySelector('.loading-animation').style.display = 'none';
            //init();
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

        this.playerController.update(this.deltaTime);
        this.playerController.updatePhysics(this.deltaTime);
        this.spellCaster.update(this.deltaTime);

        this.cameraManager.update(this.deltaTime);
        this.minionControllers.forEach((controller) => controller.update(this.deltaTime));
        this.worldManager.world.update(this.deltaTime);
        //...
        this.viewManager.updateAnimatedViews(this.deltaTime);

        this.renderer.render( this.scene, this.cameraManager.camera );
        //OrbitControls -- DEBUG STATEMENTS --
        // this.renderer.render( this.scene, orbitCam );
        //OrbitControls -- DEBUG STATEMENTS --
    }
}

let app = new App({});
await app.loadAssets();
app.start();