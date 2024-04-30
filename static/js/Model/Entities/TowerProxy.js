import {ProxyEntity} from "./Buildings/ProxyEntity.js";

export class TowerProxy extends ProxyEntity{
    constructor(params) {
        super(params);

    }

    /**
     * Function for when the tower dies
     */
    die() {
        //TODO: Implement tower exploding/dissapearing?
    }
}