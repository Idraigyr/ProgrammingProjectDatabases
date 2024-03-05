import * as THREE from 'three';
import WebGL from 'three-WebGL';
import * as model from "./model.js"
import {
    horizontalSensitivity,
    maxZoomDistance,
    minZoomDistance,
    primaryBackwardKey,
    DownKey,
    primaryForwardKey,
    primaryLeftKey,
    primaryRightKey,
    upKey,
    secondaryBackwardKey,
    secondaryForwardKey,
    secondaryLeftKey,
    secondaryRightKey,
    movementSpeed,
    verticalSensitivity,
    zoomSensitivity,
    sprintMultiplier,
    sprintKey,
    minZoomIn,
    maxZoomIn,
    buildKey,
    minCameraY
} from "./config.js";
import {max, min} from "./helpers.js";
import {Placeable} from "./model.js";
// import {Vector3} from "three";
import {GLTFLoader} from "three-GLTFLoader";
import {PlayerFSM} from "../js_refactored/Patterns/FiniteStateMachine.js";
import {grassUniforms, generateField} from "./visual/grass.js"

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
let gridCellSize = 10;
let cellsInRow = 15;
let islandThickness = 10;
let blockPlane, altar;
const geometry2 = new THREE.PlaneGeometry( 1000, 1000 );
				geometry2.rotateX( - Math.PI / 2 );
new THREE.Mesh( geometry2, new THREE.MeshBasicMaterial( { visible: false } ) );
let pointer = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
const touchableObjects = []
let enableBuilding = true;
let debugTrue = false;
let currentThingToPlace = new Placeable();
let rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
let rollOverMesh;

// TODO: where should we place this function?
/**
 * Corrects (e.g. centralize on the grid cell) the given object
 * @param object object to centralize
 */
function correctRitualPosition(object){
    // rollOverMesh.position.divideScalar( gridCellSize ).floor().multiplyScalar( gridCellSize ).addScalar( gridCellSize/2 );
    const boundingBox = new THREE.Box3().setFromObject(object);
    object.position.add(new THREE.Vector3(0,-boundingBox.min.y,0));
    // rollOverMesh.position.y = 0;
}

class CameraManager{
#camera;
    #target;
    #offset;
    #lookAt;
    #zoom;
    constructor(params) {
        this.#camera = params.camera;
        this.#target = params.target;
        this.#offset = new THREE.Vector3(-5,2,1);
        this.#lookAt = new THREE.Vector3(500,0,0);
        this.#zoom = minZoomIn;
        //there is no zoomOut functionality so not functional
        // document.addEventListener("keydown", (e) => {
        //     if(e.code === "KeyO"){
        //         this.zoomIn(0.2);
        //     } else if (e.code === "KeyP"){
        //         this.zoomIn(-0.2);
        //     }
        // });
    }

    calculateZoom(idealOffset, idealLookAt, zoomIn){
        let vec = new THREE.Vector3().copy(idealOffset);
        let vec2 = new THREE.Vector3().copy(idealLookAt);
        vec2.multiplyScalar(-1);
        vec.add(vec2);
        vec.normalize();
        vec.multiplyScalar(max(maxZoomIn, min(minZoomIn, zoomIn)));
        return vec;
    }
    zoomIn(amount){
        this.#zoom = max(maxZoomIn, min(minZoomIn, this.#zoom + amount));
    }

    transformVecWithTarget(vector){
        vector.applyQuaternion(this.#target.rotation);
        vector.add(this.#target.position);
        return vector;
    }

    update(deltaTime){
        let idealOffset = this.transformVecWithTarget(new THREE.Vector3().copy(this.#offset));
        const idealLookAt = this.transformVecWithTarget(new THREE.Vector3().copy(this.#lookAt));
        let zoom = this.calculateZoom(idealOffset, idealLookAt, this.#zoom);
        let zoomIn = this.#zoom;

        let copy = idealOffset;

        //don't uncomment; freezes screen;
        //copy = copy.add(zoom);
        if(copy.y < minCameraY){
            while(copy.y < minCameraY){
                copy = new THREE.Vector3().copy(idealOffset);
                zoomIn -= 0.1;
                zoom = this.calculateZoom(idealOffset, idealLookAt, zoomIn);
                copy = copy.add(zoom);
            }
        }

        this.#camera.position.copy(copy);
        this.#camera.lookAt(idealLookAt);
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
        sprint: false,
        build: false
    }
    mouse = {
        leftClick: false,
        rightClick: false,
        deltaX: 0,
        deltaY: 0,
        x: 0,
        y: 0
    }

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
        document.addEventListener("mouseup", (e) => {
            switch (e.button){
                case 0:
                    this.mouse.leftClick = false;
                    break;
                case 2:
                    this.mouse.rightClick = false;
                    break;
                default:
                    break;
            }
        });
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
    addMouseDownListener(callback){
        document.addEventListener("mousedown", callback);
    }
    #onKeyDown(event){
        // event.preventDefault();
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
            case sprintKey:
                this.keys.sprint = true;
                break;
            case buildKey:
                this.keys.build = true;
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
            case sprintKey:
                this.keys.sprint = false;
                break;
            case buildKey:
                this.keys.build = false;
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
        this.#input = params.inputManager;
        this.#input.addMouseMoveListener(this.updateRotation.bind(this));
        this.#input.addMouseMoveListener(this.ritualManipulator.bind(this));
        this.#input.addMouseDownListener(this.ritualBuilder.bind(this));
        this.#stateMachine = params.stateMachine;

        this.fireballCooldown = 0;
    }



    updateRotation(event){
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

    /**
     * Shows roll mesh overlay (preview of the object to build)
     * @param event mouse movement event
     */
    ritualManipulator(event){
        if(!enableBuilding || rollOverMesh === undefined) return;
        pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
        raycaster.setFromCamera( pointer, camera );
        const intersects = raycaster.intersectObjects( touchableObjects, false );
				if ( intersects.length > 0 ) {

					const intersect = intersects[ 0 ];

					rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
                    correctRitualPosition(rollOverMesh);
				}
    }
    ritualBuilder(event){
        if(!enableBuilding || !currentThingToPlace.getModel()) return;
        // For object rotation. TODO: encapsulate in an apart function?
        if(event.which === 3 || event.button === 2){
            rollOverMesh.rotation.y += Math.PI/2;
            currentThingToPlace.getModel().rotation.y += Math.PI/2;
            return;
        }
        if( this.#input.keys.build ){
                        pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
                        raycaster.setFromCamera( pointer, camera );
                        const intersects = raycaster.intersectObjects( touchableObjects, true );
                        if (intersects.length > 0 ){
                            const intersect = intersects[0];
                            if(intersect.object !== blockPlane){
                                console.log("object touched");
                                intersect.object.parent.position.copy( intersect.point ).add( intersect.face.normal );
                                updateObjectToPlace(intersect.object.parent.parent);
                                return;
                            }
                            let smth = currentThingToPlace.getModel();
                            const voxel = smth.clone();
                            voxel.position.copy( intersect.point ).add( intersect.face.normal );
                            correctRitualPosition(voxel);
                            // TODO: voxel for further interaction
                            // touchableObjects.push(voxel);
                            scene.add( voxel );
                        }
                    }
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
        this.#stateMachine.updateState(deltaTime, this.#input);

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

        if (this.#input.keys.sprint) {
            this.#velocity.multiplyScalar(sprintMultiplier);
        }

        if (this.#input.keys.up && this.position.y === 0){
            this.#jumping = true;
        }

        if (this.position.y > 3){
            this.#jumping = false;
            this.#falling = true;
        }


        if(this.#jumping){
            this.#velocity.add(new THREE.Vector3(0,0.2,0));
        }
        if(this.#falling){
            this.#velocity.add(new THREE.Vector3(0,-0.2,0));
        }

        this.position.add(this.#velocity);
        if(this.position.y < 0){
            this.position.y = 0;
            this.#falling = false;
        }

        if(this.fireballCooldown === 0 && this.#input.mouse.leftClick){
            let vec = new THREE.Vector3().copy(this.position);
            vec.y = 2;
            createFireball(new THREE.Vector3(1,0,0).applyQuaternion(this.rotation),vec,20);
            this.fireballCooldown = 2;
        }
        if(this.fireballCooldown > 0){
            this.fireballCooldown = max(0,this.fireballCooldown - deltaTime);
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

let loaded = false;
let charModel;
let mixer;
let animations = {};
let loader = new GLTFLoader();

await loader.load("../static/3d-models/Wizard.glb", (gltf) => {
    charModel = gltf.scene;
    //const charModel = gltf;
    charModel.traverse(c => {
        c.castShadow = true;
    });
    scene.add(charModel);
    mixer = new THREE.AnimationMixer(model);
    let clips = gltf.animations;

    let clip = THREE.AnimationClip.findByName(clips, 'CharacterArmature|Walk');
    animations["Walk"] =  new THREE.AnimationAction(mixer, clip, charModel);
    const getAnimation =  (animName, alias) => {
        let clip = THREE.AnimationClip.findByName(clips, animName);
        animations[alias] =  new THREE.AnimationAction(mixer, clip, charModel);
    }
    getAnimation('CharacterArmature|Idle',"Idle");
    getAnimation('CharacterArmature|Run',"Run");
    getAnimation('CharacterArmature|Walk',"WalkForward");
    getAnimation('CharacterArmature|Roll',"WalkBackward");
    getAnimation('CharacterArmature|Spell1',"DefaultAttack");

    // getAnimation('CharacterArmature|Walk',"Walk");
    // getAnimation('CharacterArmature|Death',"Death");
    // getAnimation('CharacterArmature|Idle',"Idle");
    // getAnimation('CharacterArmature|Idle_Attacking',"Idle_Attacking");
    // getAnimation('CharacterArmature|Idle_Weapon',"Idle_Weapon");
    // getAnimation('CharacterArmature|PickUp',"PickUp");
    // getAnimation('CharacterArmature|Punch',"Punch");
    // getAnimation('CharacterArmature|RecieveHit',"RecieveHit");
    // getAnimation('CharacterArmature|RecieveHit_2',"RecieveHit_2");
    // getAnimation('CharacterArmature|Roll',"Roll");
    // getAnimation('CharacterArmature|Run',"Run");
    // getAnimation('CharacterArmature|Run_Weapon',"Run_Weapon");
    // getAnimation('CharacterArmature|Spell1',"Spell1");
    // getAnimation('CharacterArmature|Spell2',"Spell2");
    // getAnimation('CharacterArmature|Staff_Attack',"Staff_Attack");
},function ( xhr ) {

    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    if(xhr.loaded / xhr.total === 1) {
        loaded = true;
    }

}, (err) => {
    console.log(err);
});
// let loader = new FBXLoader();
// loader.load("./assets/asura.fbx", (fbx) => {
//     charModel = fbx;
//     charModel.traverse(c => {
//         c.castShadow = true;
//     });
//     scene.add(charModel);
//     mixer = new THREE.AnimationMixer(model);
//     clips = charModel.animations;
// },undefined, (err) => {
//     console.log(err);
// });


const sceneInit = function(scene){

    if (debugTrue){
        // create boxes
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
        // create a line
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

        // Create a point light

        const pLight = new THREE.PointLight( 0xFFFFFF, 100);
        pLight.position.set(0,5, 10);
        pLight.castShadow = true;
        scene.add(pLight);

        //create a cube
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );
        const cube = new THREE.Mesh( geometry, material );
        cube.castShadow = true;
        scene.add(cube);
    }

    //create a light
    const light = new THREE.AmbientLight( 0xFFFFFF, 2);
    light.position.set(0,3, 10);
    light.castShadow = true;
    scene.add(light);

    const dirLight = new THREE.DirectionalLight( 0xFFFFFF, 10);
    dirLight.position.set(0,100, 50);
    dirLight.castShadow = true;
    scene.add(dirLight);
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
class Fireball{
    #direction;
    #position;
    #velocity;
    constructor(direction,position,velocity) {
        this.#direction = direction;
        this.#position = position;
        this.#velocity = velocity;

        const geo = new THREE.SphereGeometry(  1 );
        const mat = new THREE.MeshPhongMaterial( { color: 0xFF6C00 } );
        const ball = new THREE.Mesh( geo, mat );
        ball.position.set(this.#position.x, this.#position.y, this.#position.z);
        this.model = ball;
    }
    update(deltaTime){
        const vec = new THREE.Vector3().copy(this.#direction);
        vec.multiplyScalar(this.#velocity*deltaTime);
        this.#position.add(vec);
        this.model.position.set(this.#position.x, this.#position.y, this.#position.z);
    }

    get position(){
        return this.#position;
    }
}

// const pnPoints = [];
// pnPoints.push( new THREE.Vector3( 0,0,0 ) );
// pnPoints.push( new THREE.Vector3( 20, 0, 0 ) );
// const geo = new THREE.BufferGeometry().setFromPoints( pnPoints );
// const mat = new THREE.LineBasicMaterial( { color: 0xFFF300 } );
// const playerNormal = new THREE.Line( geo, mat );
// scene.add(playerNormal);

loader.load("./static/3d-models/altar.glb", (gltf) => {
        altar = gltf.scene;
        altar.scale.set(3,3,3); // TODO: not just a magical value
        correctRitualPosition(altar);
        scene.add(altar);
    },undefined, (err) => {
        console.log(err);
});

let fireballs = [];

const updateFireballs = function(playerPos, deltaTime){
    fireballs.forEach((fireball) => {
        if(playerPos.distanceTo(fireball.position) > 50){
            scene.remove(fireball.model);
        }
    });
    fireballs = fireballs.filter((fireball)=> playerPos.distanceTo(fireball.position) < 50);
    fireballs.forEach((fireball) => fireball.update(deltaTime));
}

const createFireball = function(direction,position,velocity){
    let fireball = new Fireball(direction,position,velocity);
    scene.add(fireball.model);
    fireballs.push(fireball);
}
let ip = new InputManager(camera);
let player = new CharacterController({inputManager: ip, stateMachine: new PlayerFSM(animations)});
let cm = new CameraManager({
    camera: camera,
    target: player
});

let body = document.getElementById("body");
body.addEventListener("keydown", async (e) => {
    if (e.code === "KeyW" || e.code === "KeyA" || e.code === "KeyS" || e.code === "KeyD"){
        await body.requestPointerLock();
    }
});

let clock = new THREE.Clock();
function animate() {
    requestAnimationFrame( animate );
    //update world
    let deltaTime = clock.getDelta();
    grassUniforms.iTime.value = deltaTime;
    player.update(deltaTime);
    updateFireballs(player.position,deltaTime);
    cm.update(deltaTime);

    // playerNormal.position.set(player.position.x,player.position.y,player.position.z);
    // playerNormal.rotation.setFromQuaternion(player.rotation);
    //cube.position.set(player.position.x,player.position.y+0.5,player.position.z);
    if(mixer){
        mixer.update( deltaTime );
        charModel.position.set(player.position.x,player.position.y,player.position.z);
        charModel.setRotationFromQuaternion(player.quatFromHorizontalRotation);
        charModel.rotateY(180 * Math.PI / 360);
    }
    //camera.position.set(cube.position.x+10,cube.position.x+10,cube.position.x+5);
    // limitCameraPosition(camera);
    // scene.background = new THREE.TextureLoader().load( "./static/images/background-landing.jpg" );
    scene.background = new THREE.Color( 0x87CEEB );
    scaleBackground();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.render( scene, camera );
}
function limitCameraPosition(camera){
    if(debugTrue) return;
    if (camera.position.y < 3) camera.position.y = 3;
}

function scaleBackground(){
    // TODO; remove it if remove scene.background = new THREE.Color( ... );
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

function createBlock(){

    let pos = {x: 0, y: -islandThickness/2, z: 0};
    let scale = {x: cellsInRow*gridCellSize, y: islandThickness, z: cellsInRow*gridCellSize};

    //threeJS Section
    blockPlane = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({color: 0x589b80}));

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    scene.add(blockPlane);
    touchableObjects.push(blockPlane)

} // static block with physics

function buildSetup(){
    // Show build grid
    const gridHelper = new THREE.GridHelper( gridCellSize*cellsInRow, cellsInRow );
    gridHelper.position.y = 0;
    scene.add( gridHelper );
    if (!enableBuilding){
        gridHelper.visible = false;
    }
}

function createRollOver(){
    loader.load("./static/3d-models/tree.glb", (gltf) => {
        rollOverMesh = gltf.scene;
        correctRitualPosition(rollOverMesh);
        currentThingToPlace.setModel(rollOverMesh.clone());
        rollOverMesh.traverse((o) => {
            if (o.isMesh) o.material = rollOverMaterial;
        })
        scene.add(rollOverMesh);
    },undefined, (err) => {
        console.log(err);
    });
}

function updateObjectToPlace(object){
    scene.remove(rollOverMesh);
    scene.remove(currentThingToPlace.getModel());
    scene.remove( object );
    rollOverMesh = undefined;
    currentThingToPlace.setModel(undefined);
    rollOverMesh = object.clone();
    currentThingToPlace.setModel(rollOverMesh.clone());
    rollOverMesh.traverse((o) => {
            if (o.isMesh) o.material = rollOverMaterial;
        })
    scene.add(rollOverMesh);
    touchableObjects.splice( touchableObjects.indexOf( object ), 1 );
}

function init(){
    sceneInit(scene);
    // Generates grass
    generateField(scene);
    // createPlane(scene);
    createRollOver();
    buildSetup();
    // Generates terrain
    createBlock();
    // createPlane(scene);
}
// let xyz = new CharacterController({inputManager: ip, stateMachine: new FiniteStateMachine()});
// let x = xyz.position;
if ( WebGL.isWebGLAvailable()) {
    init();
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById( 'container' ).appendChild( warning );
}