import WebGL from "three-WebGL";
import * as THREE from "three";
import {Controller} from "./Controller/Controller.js";
import {API_URL} from "./configs/ControllerConfigs.js";
import {CharacterController} from "./Controller/CharacterController.js";
import {WorldManager} from "./Controller/WorldManager.js";
import {Factory} from "./Controller/Factory.js";
import {SpellFactory} from "./Controller/SpellFactory.js";
import {ViewManager} from "./Controller/ViewManager.js";
import {AssetManager} from "./Controller/AssetManager.js";
import {RaycastController} from "./Controller/RaycastController.js";
import {BuildManager} from "./Controller/BuildManager.js";

const canvas = document.getElementById("canvas");

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

        canvas.addEventListener("mousedown", async (e) => {
            if(!app.blockedInput) return;
            await canvas.requestPointerLock();
        });

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio(window.devicePixelRatio); // improve picture quality
        this.deltaTime = 0; // time between updates in seconds
        this.blockedInput = true;

        this.viewManager = new ViewManager();
        this.raycastController = new RaycastController({viewManager: this.viewManager});
        this.inputManager = new Controller.InputManager();
        this.cameraManager = new Controller.CameraManager({
            camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
            offset: new THREE.Vector3(-5,2,1),
            lookAt: new THREE.Vector3(500,0,0),
            target: null
        });
        this.cameraManager.camera.position.set(-5,2,1);
        this.cameraManager.camera.lookAt(500,0,0);
        this.playerController = null;
        this.minionControllers = [];
        this.assetManager = new AssetManager();

        this.factory = new Factory({scene: this.scene, viewManager: this.viewManager, assetManager: this.assetManager});
        this.spellFactory = new SpellFactory({scene: this.scene, viewManager: this.viewManager, assetManager: this.assetManager, camera: this.cameraManager.camera});
        this.BuildManager = new BuildManager(this.raycastController, this.scene);
        document.addEventListener("pointerlockchange", this.blockInput.bind(this), false);
        //this.inputManager.addMouseMoveListener(this.updateRotationListener);
    }

    /**
     * scopes updateRotation function of member playerController
     * @callback updateRotationListener
     * @param {{movementX: number, movementY: number}} event
     *
     */
    updateRotationListener = (event) => {
        this.playerController.updateRotation(event);
    }
    /**
     * switches value of boolean member blockedInput and adds or removes updateRotationListener from mousemovement
     * @callback blockInput
     * @param {object} event - unused
     *
     */
    blockInput(event){
        if(this.blockedInput){
            this.inputManager.addMouseMoveListener(this.updateRotationListener);
            this.blockedInput = false;
        } else {
            this.inputManager.removeMouseMoveListener(this.updateRotationListener);
            this.blockedInput = true;
        }
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
        await this.assetManager.loadViews();
        this.worldManager = new WorldManager({factory: this.factory, spellFactory: this.spellFactory});
        await this.worldManager.importWorld(`${API_URL}/...`,"request");
        this.playerController = new CharacterController({Character: this.worldManager.world.player, InputManager: this.inputManager});
        this.playerController.addEventListener("castSpell", this.spellFactory.createSpell.bind(this.spellFactory));
        this.playerController.addEventListener("updateBuildSpell", this.BuildManager.updateBuildSpell.bind(this.BuildManager));
        this.cameraManager.target = this.worldManager.world.player;
    }

    /**
     * Executes functions that only possible after assets are loaded
     */
    postAssetLoadingFunction(){
        this.BuildManager.setCurrentRitual(this.spellFactory.createTree(), true);
    }

    /**
     * Starts the game loop
     */
    start(){
        if ( WebGL.isWebGLAvailable()) {
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

        if(!this.blockedInput) {
            this.playerController.update(this.deltaTime);
            this.cameraManager.update(this.deltaTime);
        }
        this.minionControllers.forEach((controller) => controller.update(this.deltaTime));
        this.worldManager.world.update(this.deltaTime);
        //...
        this.viewManager.updateAnimatedViews(this.deltaTime);

        this.renderer.render( this.scene, this.cameraManager.camera );
    }
}

let app = new App({});
await app.loadAssets();
app.postAssetLoadingFunction();
app.start();