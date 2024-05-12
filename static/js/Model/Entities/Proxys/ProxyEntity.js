import {Entity} from "../Entity.js"
import * as THREE from "three";

/**
 * Base class for the proxy model
 */
export class ProxyEntity extends Entity {
    /**
     * Constructor for the proxy entity
     * @param {{building: Placeable, health: number | undefined, maxHealth: number | undefined }} params
     */
    constructor(params) {
        super(params);
        this.building = params.building;
        this.health = params?.health ?? 100;
        this.maxHealth = params?.maxHealth ?? 100;


    }
    takeDamage(damage){
        this.health -= damage;
        this.dispatchEvent(new CustomEvent("healthChange", {detail: {health: this.health, maxHealth: this.maxHealth}}));
        if(this.health <= 0){
            this.health = 0;
            this.dies();
        }
    }

    /**
     * what happens when the entity dies*
     */
    dies(){
        throw new Error("pure virtual function called (ProxyEntity.die)");
    }

    /**
     * Getter for the type of the building
     * @returns {string} the type of the building
     */
    get type() {
        return this.building.dbType;
    }
}