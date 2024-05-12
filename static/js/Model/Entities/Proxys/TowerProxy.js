import {ProxyEntity} from "./ProxyEntity.js";

export class TowerProxy extends ProxyEntity{
    constructor(params) {
        super(params);

    }

    /**
     * Function for when the tower dies
     */
    dies() {
        //TODO: Implement tower exploding/dissapearing?
        console.log("TowerProxy dies");
        super.dispose();
    }
}