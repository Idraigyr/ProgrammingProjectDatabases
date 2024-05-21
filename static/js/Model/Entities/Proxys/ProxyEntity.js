import {Entity} from "../Entity.js"
import * as THREE from "three";

/**
 * Base class for the proxy model
 */
export class ProxyEntity extends Entity {
    /**
     * Constructor for the proxy entity
     * @param {{building: Placeable, buildingName: string, health: number | undefined, maxHealth: number | undefined }} params
     */
    constructor(params) {
        super(params);
        this.buildingName = params.buildingName;
        this.building = params.building;
        this.health = params?.health ?? 100;
        this.maxHealth = params?.maxHealth ?? 100;
        this.canMove = false;


    }
    takeDamage(damage){
        const prevHealth = this.health;
        this.health -= damage;
        this.dispatchEvent(this.createHealthUpdateEvent(prevHealth));
        if(this.health <= 0){
            this.health = 0;
            this.dies();
        }
    }

    /**
     * Create a CustomEvent for updating the health of the character
     * @param {number} prevHealth
     * @return {CustomEvent<{current: (*|number), total: (*|number)}>}
     */
    createHealthUpdateEvent(prevHealth){
        return new CustomEvent("updateHealth", {detail: {previous: prevHealth, current: this.health, total: this.maxHealth, id: this.building.id}});
    }

    /**
     * what happens when the entity dies*
     */
    dies(){
        throw new Error("pure virtual function called (ProxyEntity.die)");
    }

    /**
     * Get type of entity
     * @returns {string}
     */
    get type() {
        return "proxy";
    }

    /**
     * getter for the dbType of the building
     * @return {string}
     */
    get dbType(){
        return this.building.dbType;
    }
}