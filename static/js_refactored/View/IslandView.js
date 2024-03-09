import * as THREE from "three";
import {IView} from "./View.js";


export class Island extends IView{
    #gridCellSize;
    #cellsInRow;
    #islandThickness;
    blockPlane;
    constructor(gridCellSize = 10, cellsInRow = 15, islandThickness = 10) {
        super();
        this.#gridCellSize = gridCellSize;
        this.#cellsInRow = cellsInRow;
        this.#islandThickness = islandThickness;
        this.buildings = [];
    }
    createIsland(){

    }
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

    initScene(){
        const group = new THREE.Group();

        group.add(this.createAxes());

        group.add(this.createLights());

        group.add(this.createPlane());
        return group;
    }
}