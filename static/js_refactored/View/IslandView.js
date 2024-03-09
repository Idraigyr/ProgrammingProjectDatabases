import * as THREE from "three";
import {IView} from "./View.js";


export class Island extends IView{
    constructor() {
        super();
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
        const geo1 = new THREE.PlaneGeometry(2000,2000);
        const mat1 = new THREE.MeshPhongMaterial({color: 0xffffff, side: THREE.DoubleSide});
        const plane = new THREE.Mesh(geo1, mat1);
        plane.setRotationFromEuler(new THREE.Euler(180 * Math.PI / 360, 0 ,0, 'XYZ'));
        plane.position.set(0,0,0);
        group.add(plane);
        for(let i = -100; i <= 100; i++){
            const points = [];
            points.push( new THREE.Vector3( 1000, 0, i*10 ) );
            points.push( new THREE.Vector3( -1000, 0, i*10 ) );
            const geo1 = new THREE.BufferGeometry().setFromPoints( points );
            const mat1 = new THREE.LineBasicMaterial( { color: 0x000000 } );
            const line = new THREE.Line( geo1, mat1 );
            group.add(line);

            const points2 = [];
            points2.push( new THREE.Vector3( i*10, 0, 1000 ) );
            points2.push( new THREE.Vector3( i*10, 0, -1000 ) );
            const geo2 = new THREE.BufferGeometry().setFromPoints( points2 );
            const mat2 = new THREE.LineBasicMaterial( { color: 0x000000 } );
            const line2 = new THREE.Line( geo2, mat2 );
            group.add(line2);
        }
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