import {ProxyEntity} from "./ProxyEntity.js";

/**
 * Altar Proxy
 */
export class AltarProxy extends ProxyEntity{
    constructor(params) {
        super(params);
    }

    /**
     * Function for when the altar dies and the match is over
     */
    dies() {
        //TODO: Implement match end
        super.dispose();
    }
}