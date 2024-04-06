import * as THREE from "three";
import {Entity} from "./Entity.js";
import {buildTypes} from "../configs/Enums.js";

/**
 * model of foundation which is a grid based plane with a center-square, meaning both width and length are uneven
 * position is the center of the foundation and needs to be in grid coordinates, meaning in multiples of gridCellSize
 * @extends Entity
 */
export class Foundation extends Entity{
    #rotation;


    /**
     * creates a foundation which is a grid based plane with a center-square, meaning both width and length are uneven
     * @param {{width: Number, length: Number, rotation: Number, height: Number}} params - width and length are always uneven, if not they are increased by 1. height is always larger than 0 otherwise = 0.1
     */
    constructor(params) {
        super(params);
        this.#rotation = 0;
        this.rotation = params.rotation;

        this.width = params?.width ?? 15;
        this.width = this.width % 2 === 0 ? this.width + 1 : this.width;

        this.length = params?.length ?? 15;
        this.length = this.length % 2 === 0 ? this.length + 1 : this.length;

        this.height = params?.height ?? 0;
        this.height = this.height > 0 ? this.height : 0.1;

        this.min = new THREE.Vector3();
        this.max = new THREE.Vector3();

        this.grid = new Array(params.width*params.length).fill(buildTypes.getNumber("empty"));
    }

    transformGridToSize(width,length){
        if(width < this.width || length < this.length) return null;
        const newGrid = new Array(width*length).fill(buildTypes.getNumber("void"));
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.length; j++){
                newGrid[(i + (width - 1)/2)*width + (j + (length -1)/2)] = this.grid[(i + (this.width - 1)/2)*this.width + (j + (this.length -1)/2)];
            }
        }
        return (width + (this.width - 1)/2)*this.width + (length + (this.length -1)/2);
    }

    set position(vector){
        const delta = vector.clone().sub(this.position);
        this.min.add(delta);
        this.max.add(delta);
        super.position = vector;
    }

    set rotation(value){
        if([0,180,-0,-180].includes(value%360)) return;
        if([90,270,-90,-270].includes(value%360)){
            this.#rotation = value;
            const temp = this.width;
            this.width = this.length;
            this.length = temp;
            //TODO: rotate min & max;
        }
    }
}