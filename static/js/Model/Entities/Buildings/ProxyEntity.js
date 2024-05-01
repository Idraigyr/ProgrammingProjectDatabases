import {Entity} from "../Entity.js"
import * as THREE from "three";

/**
 * Base class for the proxy model
 */
export class ProxyEntity extends Entity {
    constructor(params) {
        super(params);
        this.health = params?.health ?? 100;
        this.maxHealth = params?.maxHealth ?? 100;


    }
    takeDamage(damage){
        this.health -= damage;
        this.dispatchEvent(new CustomEvent("healthChange", {detail: {health: this.health, maxHealth: this.maxHealth}}));
        if(this.health <= 0){
            this.health = 0;
            this.die();
        }
    }

    /**
     * what happens when the entity dies*
     */
    die(){
        throw new Error("pure virtual function called (ProxyEntity.die)");
    }

    /**
     * @returns {string}
     */
    get type() {
        return "proxy";
    }



}