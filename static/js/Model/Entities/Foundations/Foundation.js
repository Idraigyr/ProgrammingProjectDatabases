import * as THREE from "three";
import {Entity} from "../Entity.js";
import {buildTypes} from "../../../configs/Enums.js";
import {gridCellSize} from "../../../configs/ViewConfigs.js";
import {assert, getBuildingNumberColor, printFoundationGrid, returnWorldToGridIndex} from "../../../helpers.js";

/**
 * model of foundation which is a grid based plane with a center-square, meaning both width and length are uneven
 * position is the center of the foundation and needs to be in grid coordinates, meaning in multiples of gridCellSize
 * @extends Entity
 */
export class Foundation extends Entity{
    #rotation;


    /**
     * creates a foundation which is a grid based plane with a center-square, meaning both width and length are uneven
     * @param {{width: Number, length: Number, rotation: Number, height: Number} | Foundation[]} params - width and length are always uneven, if not they are increased by 1. height is always larger than 0 otherwise = 0.1
     */
    constructor(params) {
        params.mass = 0;
        super(params);
        this.#rotation = 0;

        if(params instanceof Array){
            this.setFromFoundations(params);
        } else {
            this.width = params?.width ?? 15;
            this.width = this.width % 2 === 0 ? this.width + 1 : this.width;

            this.length = params?.length ?? 15;
            this.length = this.length % 2 === 0 ? this.length + 1 : this.length;

            this.height = 0; //TODO: is height needed?
            // this.height = params?.height ?? 0;
            // this.height = this.height > 0 ? this.height : 0.1;
            let extreme = this.calculateExtreme(this.position, this.width, this.length);
            this.min = new THREE.Vector3(extreme.x, 0, extreme.z);

            extreme = this.calculateExtreme(this.position, this.width, this.length, false);
            this.max = new THREE.Vector3(extreme.x, 0, extreme.z);

            this.grid = new Array(this.width*this.length).fill(buildTypes.getNumber("empty"));

            if(params?.rotation) {
                this.rotation = params.rotation;
            }
        }
    }

    /**
     * calculate min or max of the foundation
     * @param {{x: Number, z: Number}} position - center, position % gridCellSize === 0
     * @param {Number} width - width % 2 === 1
     * @param {Number} length - length % 2 === 1
     * @param {Boolean} min - if true calculates min, if false calculates max
     * @return {{x: number, z: number}} - center position of a min or max gridCell
     */
    calculateExtreme(position, width, length, min=true){
        assert(width % 2 !== 0 && length % 2 !== 0, "width and length need to be uneven");
        return {x: Math.floor(position.x + (min ? -1 : 1)*(width -1)*gridCellSize/2), z:  Math.floor(position.z + (min ? -1 : 1)*(length -1)*gridCellSize/2)};
    }

    /**
     * calculates the center position of the foundation based on the min and length of the foundation - min and length need to be initialized
     * @return {THREE.Vector3}
     */
    #getCenterPosition(){
        return new THREE.Vector3(this.min.x + (this.width - 1)*gridCellSize/2, 0, this.min.z + (this.length - 1)*gridCellSize/2);
    }

    /**
     * calculates the width, length, min and max of the foundation based on the min and max of the foundations
     * @param {Foundation[]} foundations
     * @return {{min: THREE.Vector3, max: THREE.Vector3, width: number, length: number}}
     */
    #calculateWidthAndLength(foundations){
        assert(foundations.length > 0, "Can't construct a foundation from an empty array of foundations");
        let min = new THREE.Vector3(Infinity,Infinity,Infinity);
        let max = new THREE.Vector3(-Infinity,-Infinity,-Infinity);
        for(const foundation of foundations){
            if(foundation.min.x < min.x) min.x = foundation.min.x;
            if(foundation.min.z < min.z) min.z = foundation.min.z;
            if(foundation.max.x > max.x) max.x = foundation.max.x;
            if(foundation.max.z > max.z) max.z = foundation.max.z;
        }
        //since center is 0,0 the calculated width and length needs to be + 1
        let width = Math.ceil((max.x - min.x)/gridCellSize + 1);
        let length = Math.ceil((max.z - min.z)/gridCellSize + 1);
        if(width % 2 === 0) {
            width++;
            max.x += gridCellSize;
        }
        if(length % 2 === 0) {
            length++;
            max.z += gridCellSize;
        }
        return {width: width, length: length, min: min, max: max};
    }

    //TODO: might be convenient/necessary that 0,0 is the center of the new foundation
    setFromFoundations(foundations){
        console.log("setFromFoundations");
        const {width, length, min, max} = this.#calculateWidthAndLength(foundations);
        console.log("width", width, "length", length, "min", min, "max", max);
        this.width = width;
        this.length = length;
        this.min = min;
        this.max = max;
        this.position = this.#getCenterPosition();
        this.grid = this.#calculateGridFromFoundations(foundations);
    }

    /**
     * returns a minimal Foundation that combines all foundations based on their grid and position
     * @param {Foundation[]} foundations - array of foundations
     * @return {Number[]|null} - returns null if islands overlap
     */
    #calculateGridFromFoundations(foundations){
        //calculate min and max of the worldmap
        const {width, length, min, max} = this.#calculateWidthAndLength(foundations);

        //initialize empty worldmap
        let worldMap = new Array(width*length).fill(buildTypes.getNumber("void"));

        //fill in the worldmap with the islands
        for(const foundation of foundations){
            const xMin = (foundation.min.x - min.x)/gridCellSize + 0.5;
            const zMin = (foundation.min.z - min.z)/gridCellSize + 0.5;
            // works but mirrored
            for(let z = 0; z < foundation.length; z++){
                for(let x = 0; x < foundation.width; x++){
                    let xIndex = Math.floor(xMin + x);
                    let zIndex = Math.floor(zMin + z);
                    let worldIndex = zIndex*width + xIndex;
                    let foundationIndex = z*foundation.width + x;

                    if(worldMap[worldIndex] !== buildTypes.getNumber("void")) {
                        console.error("islands overlap/invalid access");
                        return null;
                    }
                    worldMap[worldIndex] = foundation.grid[foundationIndex];
                }
            }

            // for(let x = 0; x < foundation.width; x++){
            //     for(let z = 0; z < foundation.length; z++){
            //         let xIndex = Math.floor(xMin + x);
            //         let zIndex = Math.floor(zMin + z);
            //         let worldIndex = zIndex*width + xIndex;
            //         let foundationIndex = x*foundation.length + z;
            //
            //         if(worldMap[worldIndex] !== buildTypes.getNumber("void")) {
            //             console.error("islands overlap/invalid access");
            //             return worldMap;
            //             // return null;
            //         }
            //         worldMap[worldIndex] = foundation.grid[foundationIndex];
            //     }
            // }

        }
        return worldMap;
    }

    getTraversableNeighbours(index){
        let neighbors = [];
        if(index % this.width > 0 && this.grid[index - 1] === buildTypes.getNumber("empty")) neighbors.push(index - 1); //has left neighbour
        if(index % this.width < this.width - 1 && this.grid[index + 1] === buildTypes.getNumber("empty")) neighbors.push(index + 1); //has right neighbour
        if(index >= this.width && this.grid[index - this.width] === buildTypes.getNumber("empty")) neighbors.push(index - this.width); // has top neighbour
        if(index < this.width*(this.length - 1) && this.grid[index + this.width] === buildTypes.getNumber("empty")) neighbors.push(index + this.width); // has bottom neighbour
        //TODO: add diagonal neighbors?
        return neighbors;
    }

    /**
     * Returns the distance between two cells
     * @param index1 - index of the first cell
     * @param index2 - index of the second cell
     * @returns {number} - distance between the two cells
     */
    getDistance(index1, index2){
        let x1 = index1 % this.width;
        let z1 = Math.floor(index1/this.width);
        let x2 = index2 % this.width;
        let z2 = Math.floor(index2/this.width);
        let dx = Math.abs(x1 - x2);
        let dz = Math.abs(z1 - z2);
        // return Math.abs(x1 - x2) + Math.abs(z1 - z2);
        return dx > dz ? 14*dz + 10*(dx - dz) : 14*dx + 10*(dz - dx);
    }

    /**
     * calculates an index for a 1D array based on 2D coordinates where the center of the foundation is 0,0
     * (i.e. x and z can be negative)
     * @param {number} x
     * @param {number} z
     * @return {number}
     * @protected
     */
    _calculate1DIndex(x, z){
        return (z + (this.length -1)/2)*this.width + (x + (this.width - 1)/2);
    }

    /**
     * Returns the type of the cell at the worldPosition
     * @param worldPosition - position in world coordinates
     * @returns {any} - type of the cell
     */
    checkCell(worldPosition){
        let {x, z} = returnWorldToGridIndex(worldPosition.sub(this.position));
        // return buildTypes.getName(this.grid[x + 7][z + 7]);
        return this.grid[this._calculate1DIndex(x, z)];
    }


    //TODO: is temp for helping with testing
    occupyCell(worldPosition, char){
        //check if parameter of returnWorldToGridIndex is correct
        let {x, z} = returnWorldToGridIndex(worldPosition.sub(this.position));
        console.log("Occupying cell: x", x, "z", z);
        const index = this._calculate1DIndex(x, z);
        // this.grid[x + 7][z + 7] = buildTypes.getNumber(dbType);
        this.grid[index] = char;
        return index;
    }


    /**
     * Set position of the foundation, also updates min and max
     * @param vector - new position
     */
    set position(vector){
        const delta = vector.clone().sub(this._position);
        this.min.x += delta.x;
        this.min.z += delta.z;

        this.max.x += delta.x;
        this.max.z += delta.z;

        super.position = vector;
    }

    /**
     * Get position of the foundation
     * @returns {*} - position of the foundation
     */
    get position(){
        return super.position;
    }

    /**
     * helper function to rotate a grid by 90 degrees
     * @param {Array} grid
     * @param {number} width
     * @param {number} length
     * @return {Array}
     */
    _rotateGrid90Deg(grid, width, length) {
        let rotatedGrid = new Array(length*width).fill(0);
        for(let x = 0; x < length; x++){
            for(let z = 0; z < width; z++){
                let index = x*width + z;
                let newIndex = (width - z - 1) * length + x;
                rotatedGrid[newIndex] = this.grid[index];
            }
        }
        return rotatedGrid;
    }

    /**
     * Get rotation of the foundation in degrees +-(0, 90, 180, 270)
     * @return {number}
     */
    get rotation(){
        return this.#rotation;
    }


    /**
     * Set rotation of the foundation, also updates width and length
     * @param {number} value - rotation in degrees +-(0, 90, 180, 270)
     */
    set rotation(value){
        console.log("setter rotation: new rotation:", value, "current rotation:", this.#rotation);
        if([0, -0, 90,180,270,-90,-180,-270].includes(value%360)){
            console.log("setter rotation", value)
            const rotateAmount = value - this.#rotation;
            this.#rotation = value;
            const temp = this.width;
            this.width = this.length;
            this.length = temp;

            for(let i = 0; i < (rotateAmount + 360)%360/90; i++){
                this.grid = this._rotateGrid90Deg(this.grid, this.width, this.length);
                //--DEBUG--
                console.log("rotated grid");
                printFoundationGrid(this.grid, this.width, this.length);
                //--DEBUG--
            }

            let extreme = this.calculateExtreme(this.position, this.width, this.length);
            this.min.set(extreme.x, 0, extreme.z);

            extreme = this.calculateExtreme(this.position, this.width, this.length, false);
            this.max.set(extreme.x, 0, extreme.z);
        } else {
            console.error("rotation needs to be a multiple of 90 degrees");
        }
        console.log("setter rotation is done: current rotation:", this.#rotation)
    }
}