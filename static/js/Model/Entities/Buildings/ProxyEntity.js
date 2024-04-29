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

    get type() {
        return "proxy";
    }



}