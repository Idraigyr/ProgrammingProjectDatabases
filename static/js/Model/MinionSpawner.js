import * as THREE from "three";
import {Subject} from "../Patterns/Subject.js";

/**
 * Class for a minion spawner
 */
export class MinionSpawner extends Subject{
    constructor(params) {
        super(params);
        this.counter = 0;
        this.maxSpawn = params?.maxSpawn ?? 5;
        this.timer = 0;
        this.interval = params?.interval ?? 4;
        this.position = params?.position ?? new THREE.Vector3(0,0,0);
        this.types = ["SkeletonMinion", "SkeletonWarrior", "SkeletonMage", "SkeletonRogue"];
    }

    /**
     * Update the spawner
     * @param deltaTime {number} Time since last update
     */
    update(deltaTime) {
        this.timer += deltaTime;
        if(this.timer >= this.interval && this.counter < this.maxSpawn){
            console.log("Spawning minion");
            this.dispatchEvent(this._createMinionEvent());
            this.timer = 0;
            this.counter++;
        }
    }

    /**
     * Create a custom event for spawning a minion
     * @return {CustomEvent<{spawn: THREE.Vector3, type: string}>}
     * @protected
     */
    _createMinionEvent() {
        return new CustomEvent("createMinion", {
            detail: {
                type: this.types[Math.floor(Math.random()*4)],
                spawn: this.position
            }
        });
    }
}