import {Placeable} from "./Placeable.js";
import {timeDifferenceInSeconds} from "../../../helpers.js";
import {API_URL, placeableURI} from "../../../configs/EndpointConfigs.js"

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
        this.lastCollected = null;
        if(params.lastCollected){
            this.lastCollected = params.lastCollected;
        }else if (this.id){
            this.fetchLastCollected();
        }
        this.productionRate = 10; //TODO: calculate based on level and equipped gems
        this.#maxCrystals = this.#calculateMaxCrystals();
        this.upgradable = true;
    }
    async fetchLastCollected(){
        try{
            $.ajax({
                url: `${API_URL}/${placeableURI}/${this.dbType}?placeable_id=${this.id}`,
                type: "GET",
                async: true,
                contentType: "application/json",
                success: (data) => {
                    console.log("Last collectd before: ", this.lastCollected, "Last collected after(?): ", data.last_collected);
                    this.lastCollected = new Date(data.last_collected);
                    // Add timezone offset
                    this.lastCollected.setMinutes(this.lastCollected.getMinutes() - this.lastCollected.getTimezoneOffset());
                    },
                error: (e) => {
                    console.error("Error fetching last collected, current id: ", this.id);
                    console.error(e);
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * calculate the amount of crystals that can be taken from the mine and resets the stored amount
     * @param currentTime
     * @return {number} - the amount of crystals
     */
    takeStoredCrystals(currentTime){
        console.log("Taking stored crystals, current time: ", currentTime, "last collected: ", this.lastCollected);
        const amount = this.checkStoredCrystals(currentTime);
        this.updateLastCollected(currentTime);
        return amount;
    }

    async updateLastCollected(currentTime){
        this.lastCollected = currentTime;
        // Send info to backend
        $.ajax({
            url: `${API_URL}/${placeableURI}/${this.dbType}`,
            type: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                placeable_id: this.id,
                last_collected: currentTime
            }),
            error: (e) => {
                console.error(e);
            }
        })
    }

    /**
     * calculate the amount of crystals that can be taken from the mine
     * @param currentTime
     * @return {number}
     */
    checkStoredCrystals(currentTime){
        let timePassed = timeDifferenceInSeconds(this.lastCollected, currentTime);
        if(this.lastCollected.getFullYear() <= 2000){
            // Our game is not that old
            this.updateLastCollected(currentTime);
            timePassed = 0;
        }
        return Math.min(this.maxCrystals, timePassed * this.productionRate);
    }

    levelUp() {
        super.levelUp();
        this.#maxCrystals = this.#calculateMaxCrystals();
    }

    /**
     * calculates the max amount of crystals that can be stored in the mine, based on the level
     * @return {number}
     */
    #calculateMaxCrystals(){
        if (this.level === 0) return 100;
        return this.level * 1000;
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
     * @param playerInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @return {JSON}
     */
    formatPOSTData(playerInfo , islandPosition){
        const obj = super.formatPOSTData(playerInfo, islandPosition);
        obj.mine_type = "crystal";
        return obj;
    }

    /**
     * return a json object with the data of the mine formatted for a PUT request
     * @param playerInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @returns {*} the building type
     */
    formatPUTData(playerInfo, islandPosition) {
        const obj = super.formatPUTData(playerInfo, islandPosition);
        obj.mine_type = "crystal";
        return obj;
    }
}