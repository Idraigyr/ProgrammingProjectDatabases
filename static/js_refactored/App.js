import WebGL from "three/addons/capabilities/WebGL";
import * as THREE from "three";
import {Controller} from "./Controller/Controller";
import {API_URL} from "./Controller/config";
import {CharacterController} from "./Controller/CharacterController";
import {WorldManager} from "./Controller/WorldManager";
import {Factory} from "./Controller/Factory";
class App {
    constructor(params) {
        this.clock = new THREE.Clock();

        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );
        this.deltaTime = 0; // time between updates in seconds
        this.blockedInput = true;
        this.inputManager = new Controller.InputManager();
        this.cameraManager = new Controller.CameraManager({camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )});
        this.cameraManager.camera.position.set(-10,10,-10);
        this.cameraManager.camera.lookAt(0,0,0);
        this.playerController = null;
        this.minionControllers = [];

        this.factory = new Factory(this.scene);

        document.addEventListener("pointerlockchange", this.blockInput.bind(this), false);
    }

    updateRotationListener = (event) => {
        this.playerController.updateRotation(event);
    }
    blockInput(){
        if(this.blockedInput){
            this.inputManager.addMouseMoveListener(this.updateRotationListener);
            this.blockedInput = false;
        } else {
            this.inputManager.removeMouseMoveListener(this.updateRotationListener);
            this.blockedInput = true;
        }
        console.log("blocked: ", this.blockedInput);
    }

    addMinionController(controller){
        this.minionControllers.push(controller);
    }

    removeMinionController(controller){
        this.minionControllers.filter((c) => controller !== c);
    }

    async loadAssets(){
        this.worldManager = await new WorldManager(this.factory);
        await this.worldManager.importWorld(`${API_URL}/...`,"request");
        this.playerController = new CharacterController({Character: this.worldManager.world.player, InputManager: this.inputManager});

        this.cameraManager.target = this.worldManager.world.player;
    }
    start(){
        if ( WebGL.isWebGLAvailable()) {
            //init();
            this.update();
        } else {
            const warning = WebGL.getWebGLErrorMessage();
            document.getElementById( 'container' ).appendChild( warning );
        }
    }
    update(){
        requestAnimationFrame(() => {
            this.update();
        });

        this.deltaTime = this.clock.getDelta();

        if(!this.blockedInput) {}
        this.playerController.update(this.deltaTime);
        this.minionControllers.forEach((controller) => controller.update(this.deltaTime));
        this.worldManager.world.update(this.deltaTime);
        //...
        this.renderer.render( this.scene, this.cameraManager.camera );
    }
}
let body = document.getElementById("body");
body.addEventListener("mousedown", async (e) => {
    await body.requestPointerLock();
});

let app = await new App();
await app.loadAssets();
app.start();