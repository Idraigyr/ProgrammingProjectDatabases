import {IView} from "./View.js";
import * as THREE from "three";
import {gridCellSize} from "../configs/ViewConfigs.js";

/**
 * Bridge view
 */
export class Bridge extends IView{
    #width;
    #length;
    #islandThickness;
    #yOffset;
    constructor(params) {
        super(params);
        this.#width = params?.width ?? 15;
        this.#length = params?.length ?? 15;
        this.#islandThickness = params?.islandThickness ?? 0.1;
        this.#yOffset = 0;
    }

    /**
     * Create plane for the bridge
     * @returns {THREE.Mesh} group of plane object
     */
    createPlane(){
        this.#yOffset = -this.#islandThickness/2;
        let pos = {x: this.position.x, y: -this.#islandThickness/2, z: this.position.z};
        let scale = {x: this.#width*gridCellSize, y: this.#islandThickness, z: this.#length*gridCellSize};

        //threeJS Section
        let blockPlane = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({color: 0x423f36}));

        blockPlane.position.set(pos.x, pos.y, pos.z);
        blockPlane.scale.set(scale.x, scale.y, scale.z);

        blockPlane.castShadow = true;
        blockPlane.receiveShadow = true;

        return blockPlane;
    }

    /**
     * Initialize the bridge model
     * @returns {THREE.Mesh} group of scene objects
     */
    initScene(){
        const plane = this.createPlane();
        this.charModel = plane;
        return plane;
    }

}