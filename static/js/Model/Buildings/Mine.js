import {Placeable} from "./Placeable.js";
import {timeDifferenceInSeconds} from "../../helpers.js";

/**
 * Class for the mine model
 */
export class Mine extends Placeable{
    #maxCrystals;

    /**
     * Constructor for the mine model
     * @param {{lastCollected: Date}} params
     * lastCollected: the last time the mine was emptied
     */
    constructor(params) {
        super(params);
        this.timeToBuild = 300;
        this.lastCollected = params.lastCollected;
        this.productionRate = 10; //TODO: calculate based on level and equipped gems
        this.#maxCrystals = this.#calculateMaxCrystals();
    }

    /**
     * calculate the amount of crystals that can be taken from the mine and resets the stored amount
     * @param currentTime
     * @return {number} - the amount of crystals
     */
    takeStoredCrystals(currentTime){
        console.log("Taking stored crystals, current time: ", currentTime, "last collected: ", this.lastCollected);
        const amount = this.checkStoredCrystals(currentTime);
        this.lastCollected = currentTime;
        return amount;
    }

    /**
     * calculate the amount of crystals that can be taken from the mine
     * @param currentTime
     * @return {number}
     */
    checkStoredCrystals(currentTime){
        const timePassed = timeDifferenceInSeconds(this.lastCollected, currentTime);
        return Math.min(this.maxCrystals, timePassed * this.productionRate);
    }

    /**
     * calculates the max amount of crystals that can be stored in the mine, based on the level
     * @return {number}
     */
    #calculateMaxCrystals(){
        return 1000 + this.level * 1000;
    }

    /**
     * Get the max amount of crystals that can be stored in the mine, based on the level
     * @return {number}
     */
    get maxCrystals(){
        return this.#maxCrystals;
    }

    /**
     * Get the type of the mine as accepted by the database
     * @return {string}
     */
    get dbType(){
        return "mine_building";
    }

    /**
     * return a json object with the data of the mine formatted for a POST request
     * @param userInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @return {JSON}
     */
    formatPOSTData(userInfo , islandPosition){
        const obj = super.formatPOSTData(userInfo, islandPosition);
        obj.mine_type = "crystal";
        return obj;
    }

    /**
     * return a json object with the data of the mine formatted for a PUT request
     * @param userInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @returns {*} the building type
     */
    formatPUTData(userInfo, islandPosition) {
        const obj = super.formatPUTData(userInfo, islandPosition);
        obj.mine_type = "crystal";
        return obj;
    }
}