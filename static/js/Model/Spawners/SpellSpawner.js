import * as THREE from "three";
import {Spawner} from "./Spawner.js";

/**
 * @class SpellSpawner - class for spawning spells
 */
export class SpellSpawner extends Spawner{
    /**
     * ctor
     * @param {{position: THREE.Vector3, team: number, spellFactory: spellFactory, direction: THREE.Vector3, spell: ConcreteSpell, interval: number, spawnPosition: THREE.Vector3}} params
     */
    constructor(params) {
        super(params);
        this.spell = params?.spell?.type;
        this.spellParams = params?.spell?.params;
    }

    /**
     * Set the spell to spawn
     * @param type - the type of spell to spawn
     * @param params - the parameters of the spell
     */
    setSpell(type, params){
        this.spell = type;
        this.spellParams = params;
    }

    /**
     * Update the spawner
     * @param deltaTime - time since last update
     */
    update(deltaTime) {
        this.timer += deltaTime;
        if(this.timer >= this.interval && this.spell){
            this.dispatchEvent(this._createSpawnEvent({
                type: this.spell,
                position: new THREE.Vector3(-7,35,-10),
                direction: new THREE.Vector3(10,-3,0).add(new THREE.Vector3(Math.random()*4-2,-Math.random()*4,Math.random()*4-2)), //TODO: change this to the location of the target
                team: 0
            }));
            this.timer = 0;
        }
    }
}
