import * as THREE from 'three';
import WebGL from 'three-WebGL';
// import {clamp, color, vec3} from "three/nodes";
import * as model from "./model.js"
import {
    horizontalSensitivity, maxZoomDistance, minZoomDistance,
    primaryBackwardKey,
    DownKey, primaryForwardKey,
    primaryLeftKey,
    primaryRightKey,
    upKey, secondaryBackwardKey, secondaryForwardKey,
    secondaryLeftKey,
    secondaryRightKey, movementSpeed, verticalSensitivity, zoomSensitivity, sprintMultiplier
} from "./config.js";
import {max, min} from "./helpers.js";
import {Character} from "./model.js";
// import {Vector3} from "three";
import {GLTFLoader} from "three-GLTFLoader";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
let gridCellSize = 15;
let cellsInRow = 15;

class CameraManager{
    #camera;
    #target;
    constructor(params) {
        this.#camera = params.camera;
        this.#target = params.target;
        this.currentPosition = new THREE.Vector3(0,0,0);
        this.currentLookAt = new THREE.Vector3(0,0,0);
    }
    half(){
        if(this.currentPosition.y < 1){
            let vec = this.currentLookAt;
            vec.multiplyScalar(0.1);
            this.currentPosition.add(vec);
            this.half();
        }
    }
    update(deltaTime){
        const idealOffset = this.calculateCameraTransformation(new THREE.Vector3(-5,2,1));
        const idealLookAt = this.calculateCameraTransformation2(new THREE.Vector3(50,0,0));

        this.currentPosition.copy(idealOffset);
        this.currentLookAt.copy(idealLookAt);
        //this.half();

        this.#camera.position.copy(this.currentPosition);
        this.#camera.lookAt(this.currentLookAt);
    }

    calculateCameraTransformation(vector){
        vector.applyQuaternion(this.#target.rotation);
        vector.add(this.#target.position);
        return vector;
    }

    calculateCameraTransformation2(vector){
        vector.applyQuaternion(this.#target.rotation);
        vector.add(this.#target.position);
        return vector;
    }
}
class InputManager {
    keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false,
    }
    mouse = {
        leftClick: false,
        rightClick: false,
        deltaX: 0,
        deltaY: 0,
        x: 0,
        y: 0
    }
    mousePrev = null;
    constructor(camera) {
        this.camera = camera;
        this.vec = new THREE.Vector3(0,0,0);
        this.player = null;
        document.addEventListener("keydown", this.#onKeyDown.bind(this));
        //document.addEventListener("keydown", (e) => this.onKeyDown(e)); better?
        document.addEventListener("keyup", this.#onKeyUp.bind(this));
        document.addEventListener("mousedown", (e) => {
            switch (e.button){
                case 0:
                    this.mouse.leftClick = true;
                    break;
                case 2:
                    this.mouse.rightClick = true;
                    break;
                default:
                    break;
            }
        });
        document.addEventListener("auxclick", (e) => Handler(e));
        //document.addEventListener("wheel", this.#onScroll.bind(this));
    }

    #onScroll(event){
        let scalar = event.deltaY;
        scalar /= 500;
        scalar *= zoomSensitivity;
        scalar = 1 + scalar;
        let vec = new THREE.Vector3(this.player.position.x - this.camera.position.x, this.player.position.y - this.camera.position.y, this.player.position.z - this.camera.position.z);
        let vec2 = vec.clone();
        vec2.normalize();
        vec.multiplyScalar(scalar);
        if(scalar < 1){
            vec2.multiplyScalar(minZoomDistance);
            camera.position.set(max(vec.x,vec2.x),max(vec.y,vec2.y),max(vec.z,vec2.z));
        } else if(scalar > 1){
            vec2.multiplyScalar(maxZoomDistance);
            camera.position.set(min(vec.x,vec2.x),min(vec.y,vec2.y),min(vec.z,vec2.z));

        }
    }
    addMouseMoveListener(callback){
        document.addEventListener("mousemove", callback);
    }
    #onKeyDown(event){
        switch (event.code){
            case upKey:
                this.keys.up = true;
                break;
            case DownKey:
                this.keys.down = true;
                break;
            case primaryLeftKey:
            case secondaryLeftKey:
                this.keys.left = true;
                break;
            case primaryRightKey:
            case secondaryRightKey:
                this.keys.right = true;
                break;
            case primaryForwardKey:
            case secondaryForwardKey:
                this.keys.forward = true;
                break;
            case primaryBackwardKey:
            case secondaryBackwardKey:
                this.keys.backward = true;
                break;
        }
    }
    #onKeyUp(event){
        switch (event.code){
            case upKey:
                this.keys.up = false;
                break;
            case DownKey:
                this.keys.down = false;
                break;
            case primaryLeftKey:
            case secondaryLeftKey:
                this.keys.left = false;
                break;
            case primaryRightKey:
            case secondaryRightKey:
                this.keys.right = false;
                break;
            case primaryForwardKey:
            case secondaryForwardKey:
                this.keys.forward = false;
                break;
            case primaryBackwardKey:
            case secondaryBackwardKey:
                this.keys.backward = false;
                break;
        }
    }

    // update(_){
    //     if (this.mousePrev !== null) {
    //         this.mouse.deltaX = this.mouse.x - this.mousePrev.x;
    //         this.mouse.deltaY = this.mouse.y - this.mousePrev.y;
    //
    //         this.previous_ = {...this.current_};
    //     }
    // }
}

class Subject {
    #observers = [];
    constructor() {
    }
    attach(observer){
        this.#observers.push(observer);
    }
    notify(){
        let message =  {};
        this.#observers.forEach((observer) => {
            observer.update(message);
        });
    }
}

class Factory{
    constructor() {
    }
}

class CharacterController extends Subject{
    #input;
    #stateMachine;
    #velocity;
    #deceleration;
    #acceleration;
    #phi = 0;
    #theta = 0;
    #falling = false;
    #jumping = false;
    constructor(params) {
        super();
        this.#deceleration = new THREE.Vector3(-0.0028, 0.1, -0.0028);
        this.#acceleration = new THREE.Vector3(0.0015, 1, 0.0015);
        this.#velocity = new THREE.Vector3(0,0,0);
        this.position = new THREE.Vector3(0,0,0);
        this.rotation = new THREE.Quaternion();
        this.rotation.identity();
        this.#input = params.inputManager;
        this.#input.addMouseMoveListener(this.updateRotation.bind(this));
        this.#stateMachine = params.stateMachine;
    }

    updateRotation(event){
        if(false){ //check for pointerlock
            return;
        }
        const {movementX, movementY} = event;
        const rotateHorizontal = (movementX * horizontalSensitivity) * (Math.PI/360);
        const rotateVertical = (movementY  * verticalSensitivity) *  (Math.PI/360);
        this.#phi -= rotateHorizontal;
        this.#theta = THREE.MathUtils.clamp(this.#theta - rotateVertical, -Math.PI/3, Math.PI /3);

        const qHorizontal = this.quatFromHorizontalRotation;
        const qVertical = new THREE.Quaternion();
        qVertical.setFromAxisAngle(new THREE.Vector3(0,0,1),this.#theta);

        let q = new THREE.Quaternion();
        q.multiply(qHorizontal);
        q.multiply(qVertical);

        this.rotation = q;
    }

    get quatFromHorizontalRotation(){
        const qHorizontal = new THREE.Quaternion();
        qHorizontal.setFromAxisAngle(new THREE.Vector3(0,1,0), this.#phi);
        return qHorizontal;
    }

    update(deltaTime){
        if(!this.#stateMachine.currentState){
            return;
        }
        this.#stateMachine.update(deltaTime, this.#input);

        const qHorizontal = this.quatFromHorizontalRotation;

        let forward = new THREE.Vector3(1,0,0);
        let strafe = new THREE.Vector3(0,0,1);
        forward.applyQuaternion(qHorizontal);
        strafe.applyQuaternion(qHorizontal);

        let forwardScale = 0;
        forwardScale += this.#input.keys.forward ? 1 : 0;
        forwardScale -= this.#input.keys.backward ? 1 : 0;

        let strafeScale = 0;

        strafeScale += this.#input.keys.right ? 1 : 0;
        strafeScale -= this.#input.keys.left ? 1 : 0;

        forward.multiplyScalar(forwardScale);
        strafe.multiplyScalar(strafeScale);

        this.#velocity = forward;
        this.#velocity.add(strafe);

        this.#velocity.normalize();

        this.#velocity.multiplyScalar(movementSpeed);

        if (this.#input.keys.shift) {
            this.#velocity.multiplyScalar(sprintMultiplier);
        }

        if (this.#input.keys.up && this.position.y === 0){
            this.#jumping = true;
        }

        if (this.position.y > 4){
            this.#jumping = false;
            this.#falling = true;
        }


        if(this.#jumping){
            this.#velocity.add(new THREE.Vector3(0,0.3,0));
        }
        if(this.#falling){
            this.#velocity.add(new THREE.Vector3(0,-0.2,0));
        }

        this.position.add(this.#velocity);
        if(this.position.y < 0){
            this.position.y = 0;
            this.#falling = false;
        }

        // const velocity = this.#velocity;
        // const frameDeceleration = new THREE.Vector3(
        //     velocity.x * this.#deceleration.x,
        //     velocity.y * this.#deceleration.y,
        //     velocity.z * this.#deceleration.z,
        // );
        // frameDeceleration.multiplyScalar(deltaTime);
        // frameDeceleration.z = Math.sign(frameDeceleration.z)* Math.min(
        //     Math.abs(frameDeceleration.z),
        //     Math.abs(velocity.z)
        // );
        //
        //
        // velocity.add(frameDeceleration);
        //
        // const acc = this.#acceleration.clone();
        //
        // if(this.#input.keys.forward){
        //     velocity.x += acc.x * deltaTime;
        // }
        // if(this.#input.keys.backward){
        //     velocity.x -= acc.x * deltaTime;
        // }
        // if(this.#input.keys.left){
        //     velocity.z -= acc.z * deltaTime;
        // }
        // if(this.#input.keys.right){
        //     velocity.z += acc.z * deltaTime;
        // }
        //
        // if (this.#input.keys.shift) {
        //     acc.multiplyScalar(2.0);
        // }
        //
        // // const oldPosition = this.position;
        // // const forward = new THREE.Vector3(1, 0, 0);
        // // const sideways = new THREE.Vector3(0, 0, 1);
        // // sideways.multiplyScalar(velocity.z * deltaTime);
        // // sideways.normalize();
        // // forward.multiplyScalar(velocity.x * deltaTime);
        // // forward.normalize();
        // //
        // // this.position.add(forward);
        // // this.position.add(sideways);
        //
        // this.position.add(velocity);
        //
        // //update rotation (only relevant for viewport)
    }


}

class FiniteStateMachine{
    currentState;
    #states = {};
    constructor(params) {

    }

    _addState(name,state){
        this.#states[name] = state;
    }

    setState(name){
        const prevState = this.currentState;
        if(prevState){
            if(prevState.name === name){
                return;
            }
            prevState.exit();
        }

        this.currentState = this.#states[name];
        this.currentState.enter(prevState);
    }

    update(deltaTime, input){
        if(this.currentState){
            this.currentState.update(deltaTime, input);
        }
    }


}

class CharacterFSM extends FiniteStateMachine {
    constructor() {
        super();
        this._addState("Walk",new WalkState(this));
        this._addState("Sprint",new SprintState(this));
        this._addState("Idle",new IdleState(this));
        this._addState("Jump",new JumpState(this));
        this.setState("Walk");
    }
}

class State {
    _owner;
    constructor(stateMachine) {
        this._owner = stateMachine;
    }

    get name(){
        return "Base";
    }
    enter(){}
    exit(){}
    update(){}
}

class WalkState extends State{
    constructor(stateMachine) {
        super(stateMachine);
    }

    get name(){
        return "Walk";
    }

    enter(prevState){
        if(prevState){

        }
    }
    exit(){}
    update(deltaTime, input){
        if(input.keys.forward){
            //placeholder for sprinting
            if(false){

            }
        } else if (input.keys.left || input.keys.right || input.keys.backward){

        } else if (input.keys.up){
            this._owner.setState("Jump");
        } else if (input.keys.down){
            //placeholder for sneak
        } else {
            this._owner.setState("Idle");
        }
    }
}

class SprintState extends State{
    constructor(stateMachine) {
        super(stateMachine);
    }

    get name(){
        return "Walk";
    }

    enter(prevState){
        if(prevState){

        }
    }
    exit(){}
    update(deltaTime, input){

    }
}

class IdleState extends State{
    constructor(stateMachine) {
        super(stateMachine);
    }

    get name(){
        return "Walk";
    }

    enter(prevState){
        if(prevState){

        }
    }
    exit(){}
    update(deltaTime, input){
        if(input.keys.forward){
            //placeholder for sprinting
            if(false){

            } else {
                this._owner.setState("Walk");
            }
        } else if (input.keys.left || input.keys.right || input.keys.backward){
            this._owner.setState("Walk");
        } else if (input.keys.up){
            this._owner.setState("Jump");
        } else if (input.keys.down){
            //placeholder for sneak
        }
    }
}

class JumpState extends State{
    constructor(stateMachine) {
        super(stateMachine);
    }

    get name(){
        return "Jump";
    }

    enter(prevState){
        if(prevState){

        }
    }
    exit(){}
    update(deltaTime, input){

    }
}


class Game {
    #world;
    constructor() {

    }
}

camera.position.set(-10,10,5)
camera.lookAt( 0, 0, 0 );

//set renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// let loader = new GLTFLoader();
const loader = new GLTFLoader();
let charModel;
let mixer;
let action;
loader.load("./static/3d-models/Wizard.glb", (gltf) => {
    charModel = gltf.scene;
    //const charModel = gltf;
    charModel.traverse(c => {
        c.castShadow = true;
    });
    scene.add(charModel);
    mixer = new THREE.AnimationMixer(model);
    const clips = gltf.animations;
    const clip = THREE.AnimationClip.findByName(clips, 'CharacterArmature|Run');
    action = new THREE.AnimationAction(mixer, clip, charModel);
    action.play();
},undefined, (err) => {
    console.log(err);
});

const sceneInit = function(scene){

    const geometry5 = new THREE.BoxGeometry( 1, 1, 1 );
    const material5 = new THREE.MeshPhongMaterial( { color: 0xFF3210 } );
    const cube2 = new THREE.Mesh( geometry5, material5 );
    cube2.castShadow = true;
    cube2.position.set(0,3,5);
    scene.add(cube2);

    const points4 = [];
    points4.push( new THREE.Vector3( cube2.position.x, cube2.position.y , cube2.position.z ) );
    points4.push( new THREE.Vector3( 0, 0, 0 ) );
    const geometry6 = new THREE.BufferGeometry().setFromPoints( points4 );
    const material6 = new THREE.LineBasicMaterial( { color: 0xFF0000 } );
    const line4 = new THREE.Line( geometry6, material6 );
    scene.add(line4);

//create a line
    const points = [];
    points.push( new THREE.Vector3( 1000, 0, 0 ) );
    points.push( new THREE.Vector3( -1000, 0, 0 ) );

    const geometry2 = new THREE.BufferGeometry().setFromPoints( points );
    const material2 = new THREE.LineBasicMaterial( { color: 0xFF0000 } ); //red, x
    const line = new THREE.Line( geometry2, material2 );

    const points2 = [];
    points2.push( new THREE.Vector3( 0, 1000, 0 ) );
    points2.push( new THREE.Vector3( 0, -1000, 0 ) );

    const geometry3 = new THREE.BufferGeometry().setFromPoints( points2 );
    const material3 = new THREE.LineBasicMaterial( { color: 0x00FF0A } ); //green, y
    const line2 = new THREE.Line( geometry3, material3 );

    const points3 = [];
    points3.push( new THREE.Vector3( 0, 0, 1000 ) );
    points3.push( new THREE.Vector3( 0, 0, -1000 ) );

    const geometry4 = new THREE.BufferGeometry().setFromPoints( points3 );
    const material4 = new THREE.LineBasicMaterial( { color: 0x0100FF } ); //blue, z
    const line3 = new THREE.Line( geometry4, material4 );
    const group = new THREE.Group();
    group.add(line);
    group.add(line2);
    group.add(line3);
    scene.add(group);

    //create a light
    const light = new THREE.AmbientLight( 0xFFFFFF, 2);
    light.position.set(0,3, 10);
    light.castShadow = true;
    scene.add(light);

    const dirLight = new THREE.DirectionalLight( 0xFFFFFF, 10);
    dirLight.position.set(0,100, 50);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pLight = new THREE.PointLight( 0xFFFFFF, 100);
    pLight.position.set(0,5, 10);
    pLight.castShadow = true;
    scene.add(pLight);
}

const createPlane = function (scene) {
    const geo1 = new THREE.PlaneGeometry(2000,2000);
    const mat1 = new THREE.MeshPhongMaterial({color: 0xffffff, side: THREE.DoubleSide});
    const plane = new THREE.Mesh(geo1, mat1);
    plane.setRotationFromEuler(new THREE.Euler(180 * Math.PI / 360, 0 ,0, 'XYZ'));
    plane.position.set(0,0,0);
    scene.add(plane);
    for(let i = -100; i <= 100; i++){
        const points = [];
        points.push( new THREE.Vector3( 1000, 0, i*10 ) );
        points.push( new THREE.Vector3( -1000, 0, i*10 ) );
        const geo1 = new THREE.BufferGeometry().setFromPoints( points );
        const mat1 = new THREE.LineBasicMaterial( { color: 0x000000 } );
        const line = new THREE.Line( geo1, mat1 );
        scene.add(line);

        const points2 = [];
        points2.push( new THREE.Vector3( i*10, 0, 1000 ) );
        points2.push( new THREE.Vector3( i*10, 0, -1000 ) );
        const geo2 = new THREE.BufferGeometry().setFromPoints( points2 );
        const mat2 = new THREE.LineBasicMaterial( { color: 0x000000 } );
        const line2 = new THREE.Line( geo2, mat2 );
        scene.add(line2);
    }
}

// const pnPoints = [];
// pnPoints.push( new THREE.Vector3( 0,0,0 ) );
// pnPoints.push( new THREE.Vector3( 20, 0, 0 ) );
// const geo = new THREE.BufferGeometry().setFromPoints( pnPoints );
// const mat = new THREE.LineBasicMaterial( { color: 0xFFF300 } );
// const playerNormal = new THREE.Line( geo, mat );
// scene.add(playerNormal);

//create a cube
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
cube.castShadow = true;
scene.add(cube);

function createPlayer(){

    let pos = {x: 3, y: 3, z: 3};
    let scale = {x: 3, y: 3, z: 3};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let playerBox = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.BoxGeometry()), new THREE.MeshPhongMaterial({color: 0x000000}));

    playerBox.position.set(pos.x, pos.y, pos.z);
    playerBox.scale.set(scale.x, scale.y, scale.z);

    // blockPlane.castShadow = true;
    // blockPlane.receiveShadow = true;

    scene.add(playerBox);

    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    playerBox.userData.physicsBody = body;
    physicsWorld.addRigidBody( body );
}

let ip = new InputManager(camera);
let player = new CharacterController({inputManager: ip, stateMachine: new CharacterFSM()});
let cm = new CameraManager({
    camera: camera,
    target: player
});

let body = document.getElementById("body");
body.addEventListener("mousedown", async (e) => {
    await body.requestPointerLock();
});

let clock = new THREE.Clock();
function animate() {
    requestAnimationFrame( animate );
    //update world
    let deltaTime = clock.getDelta();

    player.update(deltaTime);
    cm.update(deltaTime);

    updatePhysics(deltaTime);



    // playerNormal.position.set(player.position.x,player.position.y,player.position.z);
    // playerNormal.rotation.setFromQuaternion(player.rotation);
    //cube.position.set(player.position.x,player.position.y+0.5,player.position.z);
    if(mixer){
        mixer.update( deltaTime );
        charModel.position.set(player.position.x,player.position.y+0.5,player.position.z);
        charModel.setRotationFromQuaternion(player.quatFromHorizontalRotation);
        charModel.rotateY(180 * Math.PI / 360);
    }
    //camera.position.set(cube.position.x+10,cube.position.x+10,cube.position.x+5);
    limitCameraPosition(camera);
    scene.background = new THREE.TextureLoader().load( "./static/images/background-landing.jpg" );
    scene.background = new THREE.Color( 0x87CEEB );
    scaleBackground();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.render( scene, camera );
}
function limitCameraPosition(camera){
    if (camera.position.y < 3) camera.position.y = 3;
}

function scaleBackground(){
    // TODO; remove it remove scene.background = new THREE.Color( ... );
    return;
    if(!scene.background) return;
    // Yes, i use magical values
    let imgWidth = 1920;
    let imgHeight = 1280;
    const targetAspect = window.innerWidth / window.innerHeight;
    const imageAspect = imgWidth / imgHeight;
    const factor = imageAspect / targetAspect;
    // When factor larger than 1, that means texture 'wilder' than target。
    // we should scale texture height to target height and then 'map' the center  of texture to target， and vice versa.
    scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
    scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
    scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;
    scene.background.repeat.y = factor > 1 ? 1 : factor;
}

let rigidBodies = [];
let tmpTrans;
function createBlock(){

    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: cellsInRow*gridCellSize, y: 2, z: cellsInRow*gridCellSize};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    //threeJS Section
    let blockPlane = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({color: 0x027605}));

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    scene.add(blockPlane);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body, colGroupPlane, colGroupRedBall );
} // static block with physics

function createBall(){

    let pos = {x: 0, y: 20, z: 0};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let ball = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({color: 0xff0505}));

    ball.position.set(pos.x, pos.y, pos.z);

    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );

    body.setFriction(0);
    body.setRollingFriction(10);

    body.setActivationState( STATE.DISABLE_DEACTIVATION );


    physicsWorld.addRigidBody( body, colGroupRedBall, colGroupPlane | colGroupGreenBall );

    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
}

function createMaskBall(){

    let pos = {x: 1, y: 30, z: 0};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let ball = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshPhongMaterial({color: 0x00ff08}));

    ball.position.set(pos.x, pos.y, pos.z);

    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);


    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body, colGroupGreenBall, colGroupRedBall);

    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
}

function updatePhysics( deltaTime ){

    // Step world
    physicsWorld.stepSimulation( deltaTime, 10 );

    // Update rigid bodies
    for ( let i = 0; i < rigidBodies.length; i++ ) {
        let objThree = rigidBodies[ i ];
        let objAmmo = objThree.userData.physicsBody;
        let ms = objAmmo.getMotionState();
        if ( ms ) {

            ms.getWorldTransform( tmpTrans );
            let p = tmpTrans.getOrigin();
            let q = tmpTrans.getRotation();
            objThree.position.set( p.x(), p.y(), p.z() );
            objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

        }
    }

}

let physicsWorld;
let colGroupPlane = 1, colGroupRedBall = 2, colGroupGreenBall = 4
const STATE = { DISABLE_DEACTIVATION : 4 };
function setupPhysicsWorld(){
    let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration();
    let dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    let overlappingPairCache = new Ammo.btDbvtBroadphase();
    let solver = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
}
function buildSetup(){
    // Show build grid
    const gridHelper = new THREE.GridHelper( gridCellSize*cellsInRow, cellsInRow );
    gridHelper.position.y = 1.01;
    scene.add( gridHelper );
}

function init(){
    setupPhysicsWorld();
    sceneInit(scene);
    // createPlane(scene);
    buildSetup();
    tmpTrans = new Ammo.btTransform();
    createPlayer();
    createBlock();
    createBall();
    createMaskBall();
}
// let xyz = new CharacterController({inputManager: ip, stateMachine: new FiniteStateMachine()});
// let x = xyz.position;
if ( WebGL.isWebGLAvailable()) {
    // Initiate function or other initializations here
    await Ammo().then( init );
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
}