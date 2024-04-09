import * as THREE from "three";
import {IView} from "./View.js";
import {generateGrassField} from "../external/grass.js";
import {gridCellSize} from "../configs/ViewConfigs.js";


/**
 * Island view
 */
export class Island extends IView{
    #gridCellSize;
    #cellsInRow;
    #islandThickness;
    blockPlane;

    /**
     * Constructor for Island view
     * @param {cellsInRow: number, islandThickness: number} params of grid cell
     * cellsInRow number of cells in a row
     * islandThickness thickness of the island plane
     */
    constructor(params) {
        super(params);
        this.#gridCellSize = gridCellSize;
        this.#cellsInRow = params?.cellsInRow ?? 10;
        this.#islandThickness = params?.islandThickness ?? 10;
    }
    createIsland(){

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
     * @returns {THREE.Group} group of plane object
     */
    createPlane(){
        const group = new THREE.Group();
        let pos = {x: 0, y: -this.#islandThickness/2, z: 0};
        let scale = {x: this.#cellsInRow*this.#gridCellSize, y: this.#islandThickness, z: this.#cellsInRow*this.#gridCellSize};

        //threeJS Section
        this.blockPlane = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({color: 0x589b80}));

        this.blockPlane.position.set(pos.x, pos.y, pos.z);
        this.blockPlane.scale.set(scale.x, scale.y, scale.z);

        this.blockPlane.castShadow = true;
        this.blockPlane.receiveShadow = true;

        group.add(this.blockPlane);
        // TODO: how to add it?
        // touchableObjects.push(this.blockPlane)
        return group;
    }

    /**
     * Create grass field
     * @returns {THREE.Group} group of grass field
     */
    createGrassField(){
        const group = new THREE.Group();
        generateGrassField(group);
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
     * Initialize the scene
     * @returns {THREE.Group} group of scene objects
     */
    initScene(){
        const group = new THREE.Group();

        group.add(this.createLights());

        let plane = this.createPlane();
        group.add(plane);
        group.add(this.createGrassField());
        this.charModel = plane;
        return group;
    }
}