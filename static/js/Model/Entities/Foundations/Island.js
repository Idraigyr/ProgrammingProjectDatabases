import {printFoundationGrid, returnWorldToGridIndex} from "../../../helpers.js";
import {buildTypes} from "../../../configs/Enums.js";
import {Foundation} from "./Foundation.js";

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
    }

    /**
     * Occupy a cell at the given world position
     * @param worldPosition - world position to occupy
     * @param dbType - type of the building
     * @returns {number} - the index of the cell
     */
    occupyCell(worldPosition, dbType){
        if(dbType === "altar_building"){
            console.log("altar_building");
        }
        //check if parameter of returnWorldToGridIndex is correct
        let {x, z} = returnWorldToGridIndex(worldPosition.sub(this.position));
        const index = (x + (this.width - 1)/2)*this.width + (z + (this.length -1)/2);
        // this.grid[x + 7][z + 7] = buildTypes.getNumber(dbType);
        this.grid[index] = buildTypes.getNumber(dbType);
        return index;
    }

    /**
     * Free a cell at the given world position
     * @param worldPosition - world position to free
     */
    freeCell(worldPosition){
        let {x, z} = returnWorldToGridIndex(worldPosition.sub(this.position));
        // this.grid[x + 7][z + 7] = buildTypes.getNumber("empty");
        this.grid[(x + (this.width - 1)/2)*this.width + (z + (this.length -1)/2)] = buildTypes.getNumber("empty");
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
        return this.grid[(x + (this.width - 1)/2)*this.width + (z + (this.length -1)/2)];
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
     * Get a building by its world position
     * @param position - world position of the building
     * @returns {*} - the building
     */
    getBuildingByPosition(position){
        let pos = position.clone();
        pos = returnWorldToGridIndex(pos.sub(this.position));
        // Transform position to cell index
        return this.getBuildingByIndex((pos.x + (this.width - 1)/2)*this.width + (pos.z + (this.length -1)/2));
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
}