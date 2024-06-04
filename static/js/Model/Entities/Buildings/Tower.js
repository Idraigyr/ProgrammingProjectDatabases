import {Placeable} from "./Placeable.js";

/**
 * Class for the Tower model
 */
export class Tower extends Placeable{
    constructor(params) {
        super(params);
        this.spellSpawner = params.spellSpawner;
        this.timeToBuild = 600;
        this.upgradable = true;
        const stat = new Map();
        stat.set("capacity", this.level === 0 ? 50 : this.level*50);
        try {this.setStats(stat);} catch(e){this.addStat("capacity", this.level === 0 ? 50 : this.level*50)}
    }

    /**
     * Getter for the database type
     * @returns {string} the database type
     */
    get dbType(){
        return "tower_building";
    }

    /**
     * Formats the data for a POST request
     * @param playerInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} returns formatted data
     */
    formatPOSTData(playerInfo, islandPosition){
        const obj = super.formatPOSTData(playerInfo, islandPosition);
        obj.tower_type = "magic";
        return obj;
    }

    /**
     * Formats the data for a PUT request
     * @param playerInfo {JSON} the user information
     * @param islandPosition {THREE.Vector3} the world position of the island
     * @returns {{level: (*|number), rotation: number, x: number, island_id: null, z: number}} returns formatted data
     */
    formatPUTData(playerInfo, islandPosition){
        const obj = super.formatPUTData(playerInfo, islandPosition);
        obj.tower_type = "magic";
        return obj;
    }

    changeLevel(amount) {
        const result =  super.changeLevel(amount);
        const stat = new Map();
        stat.set("capacity", this.level === 0 ? 50 : this.level*50);
        try {this.setStats(stat);} catch(e){this.addStat("capacity", this.level === 0 ? 50 : this.level*50)}
        return result;
    }
}