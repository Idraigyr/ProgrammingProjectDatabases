import * as THREE from "three";
import {IView} from "./View.js";
import {generateGrassField} from "../external/grass.js";
import {gridCellSize} from "../configs/ViewConfigs.js";


/**
 * Island view
 */
export class Island extends IView{
    #width;
    #length;
    #islandThickness;
    #grassField;
    #yOffset;

    /**
     * Constructor for Island view
     * @param {{width: number, length: number, islandThickness: number}} params of grid cell
     * islandThickness thickness of the island plane
     */
    constructor(params) {
        super(params);
        this.#grassField = null;
        this.#width = params?.width ?? 15;
        this.#length = params?.length ?? 15;
        this.#islandThickness = params?.islandThickness ?? 0.1;
        this.#yOffset = 0;
    }
    /**
     * Create lights for the scene
     * @returns {Group} group of lights
     */
    createLights(){
        const group = new THREE.Group();
        const light = new THREE.AmbientLight( 0xFFFFFF, 2);
        light.position.set(0,3, 10);
        light.castShadow = true;
        group.add(light);

        const dirLight = new THREE.DirectionalLight( 0xFFFFFF, 10);
        dirLight.position.set(0,100, 50);
        dirLight.castShadow = true;
        group.add(dirLight);
        return group;
    }

    /**
     * Create plane for the island
     * @returns {THREE.Mesh} group of plane object
     */
    createPlane(){
        this.#yOffset = -this.#islandThickness/2;
        let pos = {x: this.position.x, y: -this.#islandThickness/2, z: this.position.z};
        let scale = {x: this.#width*gridCellSize, y: this.#islandThickness, z: this.#length*gridCellSize};

        //threeJS Section
        let blockPlane = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({color: 0x589b80}));

        blockPlane.position.set(pos.x, pos.y, pos.z);
        blockPlane.scale.set(scale.x, scale.y, scale.z);

        blockPlane.castShadow = true;
        blockPlane.receiveShadow = true;

        return blockPlane;
    }

    /**
     * Create grass field
     * @returns {THREE.Group} group of grass field
     */
    createGrassField(params){
        const group = new THREE.Group();
        generateGrassField(group, params);
        this.#grassField = group;
        return group;
    }

    /**
     * Create axes for the scene
     * @returns {THREE.Group} group of axes
     */
    createAxes(){
        const group = new THREE.Group();
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
        group.add(line);
        group.add(line2);
        group.add(line3);
        return group;
    }

    /**
     * Initialize the island model
     * @returns {THREE.Group} group of scene objects
     */
    initScene(){
        const group = new THREE.Group();

        group.add(this.createLights());

        let plane = this.createPlane();
        group.add(plane);
        // old implementation
        // group.add(this.createGrassField());
        // new implementation
        group.add(this.createGrassField({type: 'square', width: this.#width*gridCellSize, length: this.#length*gridCellSize, position: this.position}));
        this.charModel = plane;
        return group;
    }

    /**
     * Update position of the view
     * @param event - event with position
     */
    updatePosition(event){
        if(!this.charModel) return;
        event.detail.position.add(new THREE.Vector3(0, this.#yOffset, 0));
        const delta = new THREE.Vector3().subVectors(event.detail.position, this.position);
        this.position.copy(event.detail.position);
        this.charModel.position.copy(this.position);
        this.#grassField.position.copy(this.position);
        this.boundingBox.translate(delta);
        //normally matrixWorld is updated every frame.
        // we need to update it extra here because buildings and islands will be moved on loading of a multiplayer game,
        // we can't wait to update the matrixWorld because generateCollider depends on it
        this.charModel.updateMatrixWorld();
    }

    /**
     * Update rotation of the view
     * @param event - event with rotation
     */
    updateRotation(event){
        if(!this.charModel) return;
        this.charModel.setRotationFromQuaternion(event.detail.rotation);
        this.charModel.rotateY(this.horizontalRotation * Math.PI / 180);
        this.#grassField.rotateY(this.horizontalRotation * Math.PI / 180);
        //this.boundingBox.setFromObject(this.charModel, true);
        //check updatePosition for explanation
        this.charModel.updateMatrixWorld();
    }
}