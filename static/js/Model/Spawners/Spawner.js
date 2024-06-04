import * as THREE from "three";
import {Subject} from "../../Patterns/Subject.js";

/**
 * @class Spawner - class for spawning objects
 */
export class Spawner extends Subject{
    constructor(params) {
        super(params);
        this.timer = 0;
        this.interval = params?.interval ?? 4;
        this.position = params?.position ?? new THREE.Vector3(0,0,0);
        this.buildingID = params?.buildingID ?? null;
    }

    /**
     * Update the spawner
     */
    dispose() {
        this.dispatchEvent(this.createDeleteEvent());
    }

    /**
     * Update the spawner
     * @returns {CustomEvent<{model: Spawner}>} - the delete event
     */
    createDeleteEvent() {
        return new CustomEvent("delete", {
            detail: {
                model: this
            }
        });
    }

    /**
     * Update the spawner
     * @param deltaTime - time since last update
     */
    update(deltaTime) {

    }

    /**
     * Creates a spawn event
     * @param {Object} params - the parameters of the object
     * @returns {CustomEvent<{type: string, params: {Object}}>} - the spawn event
     * @protected - helper function
     */
    _createSpawnEvent(params) {
        return new CustomEvent("spawn", {
            detail: params
        });
    }

}