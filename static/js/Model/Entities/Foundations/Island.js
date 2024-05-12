import {convertGridIndexToWorldPosition, printFoundationGrid, returnWorldToGridIndex} from "../../../helpers.js";
import {buildTypes} from "../../../configs/Enums.js";
import {Foundation} from "./Foundation.js";
import * as THREE from "three";

/**
 * Model of an island
 */
export class Island extends Foundation{
    /**
     *
     * @param {{width: Number, length: Number, rotation: Number, height: Number}} params - width and length are always uneven, if not they are increased by 1. height is always larger than 0 otherwise = 0.1
     */
    constructor(params) {
        super(params);
        this.buildings = [];
        this.proxys = [];
    }

    /**
     * clean up the model for deletion
     */
    dispose() {
        this.buildings.forEach(building => building.dispose());
        this.disposeProxys();
        super.dispose();
    }
    /**
     * clean up the proxys for deletion & empty the proxys property
     */
    disposeProxys(){
        this.proxys.forEach(proxy => proxy.dispose());
        this.proxys = [];
    }

    /**
     * Add a proxy to the island
     * @param proxy - proxy to add
     */
    addProxy(proxy) {
        proxy.addEventListener("delete", (event) => {
            console.log("Proxy deleted from island");
            this.proxys = this.proxys.filter(proxy => proxy !== event.model);
        });
        this.proxys.push(proxy);
    }

    /**
     * Occupy a cell at the given world position
     * NOTE: does not add a building to the buildings array
     * @param worldPosition - world position to occupy
     * @param dbType - type of the building
     * @returns {number} - the index of the cell
     */
    occupyCell(worldPosition, dbType){
        //check if parameter of returnWorldToGridIndex is correct
        let {x, z} = returnWorldToGridIndex(worldPosition.sub(this.position));
        console.log("Occupying cell: x", x, "z", z, "with building type", dbType);
        const index = this._calculate1DIndex(x, z);
        console.log("Occupying cell: index", index, "with building type", dbType);
        // this.grid[x + 7][z + 7] = buildTypes.getNumber(dbType);
        this.grid[index] = buildTypes.getNumber(dbType);
        return index;
    }

    /**
     * Free a cell at the given world position
     * NOTE: does not remove the building from the buildings array
     * @param worldPosition - world position to free
     */
    freeCell(worldPosition){
        let {x, z} = returnWorldToGridIndex(worldPosition.sub(this.position));
        // this.grid[x + 7][z + 7] = buildTypes.getNumber("empty");
        this.grid[this._calculate1DIndex(x, z)] = buildTypes.getNumber("empty");
    }

    /**
     * Check the cell at the given world position
     * @param worldPosition - world position to check
     * @returns {*} - the type of the cell
     */
    checkCell(worldPosition){
        const pos = worldPosition.clone();
        const {x, z} = returnWorldToGridIndex(pos.sub(this.position));
        // return buildTypes.getName(this.grid[x + 7][z + 7]);
        return this.grid[this._calculate1DIndex(x, z)];
    }

    /**
     * Set the position of the island
     * @param vector - new position
     */
    set position(vector){
        const delta = vector.clone().sub(this.position);
        for(const building of this.buildings){
            building.position = building.position.add(delta);
        }
        super.position = vector;
    }

    /**
     * Get the position of the island
     * @returns {*} - position of the island
     */
    get position(){
        return super.position;
    }

    /**
     * Get the type of the island
     * @returns {string} - type of the island
     */
    get type(){
        return "island";
    }

    /**
     * Add a building to the island
     * @param building - building to add
     */
    addBuilding(building){
        this.buildings.push(building);
        building.cellIndex = this.occupyCell(building.position, building.dbType);
    }

    /**
     * returns all buildings on the island that are of the given type
     * @return {Placeable[]}
     */
    getBuildingsByType(type){
        return this.buildings.filter(building => building.dbType === type);
    }

    /**
     * returns all proxys on the island that are of the given type
     * @param type
     * @return {*[]}
     */
    getProxysByType(type){
        return this.proxys.filter(proxy => proxy.dbType === type);
    }

    /**
     * Get a building by its world position
     * @param position - world position of the building
     * @returns {*} - the building
     */
    getBuildingByPosition(position){
        let pos = position.clone();
        pos = returnWorldToGridIndex(pos.sub(this.position));
        // Transform position to cell index
        return this.getBuildingByIndex(this._calculate1DIndex(pos.x, pos.z));
    }

    /**
     * Get a cell index by its world position
     * @param position
     * @returns {number}
     */
    getCellIndex(position){
        let pos = position.clone();
        pos = returnWorldToGridIndex(pos.sub(this.position));
        // Transform position to cell index
        return (pos.x + (this.width - 1)/2)*this.width + (pos.z + (this.length -1)/2);
    }

    /**
     * Get a building by its cell index
     * @param index - cell index of the building
     * @returns {*} - the building
     */
    getBuildingByIndex(index){
        return this.buildings.find(building => building.cellIndex === index);
    }

    /**
     * helper function to rotate a grid by 90 degrees
     * (overloaded function from Foundation.js, also rotates & moves buildings on the island)
     * @param {Array} grid
     * @param {number} width
     * @param {number} length
     * @return {Array}
     */
    _rotateGrid90Deg(grid, width, length) {
        console.log("rotating grid 90 degrees")
        let rotatedGrid = new Array(length*width).fill(0);
        for(let x = 0; x < length; x++){
            for(let z = 0; z < width; z++){
                let index = x*width + z;
                let newIndex = (width - z - 1) * length + x;
                rotatedGrid[newIndex] = this.grid[index];
                if(this.grid[index] !== buildTypes.getNumber("empty")) {
                    const building = this.buildings.find(building => building.cellIndex === index);
                    if(!building) throw new Error("building not found");
                    building.rotate(90); //TODO: make rotation methods consistent across the codebase (use getters and setters everywhere, is better because allows for += operator)
                    building.position = convertGridIndexToWorldPosition(new THREE.Vector3(x - (this.width-1)/2, 0, (width - z - 1) - (this.length-1)/2)).add(this.position);
                    building.cellIndex = newIndex;
                }
            }
        }
        return rotatedGrid;
    }

}