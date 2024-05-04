import {Spawner} from "./Spawner.js";

/**
 * Class for a minion spawner
 */
export class MinionSpawner extends Spawner{
    constructor(params) {
        super(params);
        this.counter = 0;
        this.maxSpawn = params?.maxSpawn ?? 1;
        this.team = params?.team ?? 0;
        this.types = ["SkeletonMinion", "SkeletonWarrior", "SkeletonMage", "SkeletonRogue"];
    }

    /**
     * Update the spawner
     * @param deltaTime {number} Time since last update
     */
    update(deltaTime) {
        this.timer += deltaTime;
        if(this.timer >= this.interval && this.counter < this.maxSpawn){
            this.dispatchEvent(this._createSpawnEvent({
                type: this.types[Math.floor(Math.random()*4)],
                spawn: this.position,
                buildingID: this.buildingID,
                team: this.team
            }));
            this.timer = 0;
            this.counter++;
        }
    }
}