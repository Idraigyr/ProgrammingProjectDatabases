import {ProxyEntity} from "./ProxyEntity.js";

/**
 * Tower Proxy
 */
export class TowerProxy extends ProxyEntity{
    constructor(params) {
        super(params);

    }

    /**
     * Function for when the tower dies
     */
    dies() {
        //TODO: Implement tower exploding/dissapearing?
        super.dispose();
    }
}