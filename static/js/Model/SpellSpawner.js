import {Fireball} from "./Spell.js";
import * as THREE from "three";
import {Subject} from "../Patterns/Subject.js";

/**
 * @class SpellSpawner - class for spawning spells
 */
export class SpellSpawner extends Subject{
    /**
     * ctor
     * @param {{position: THREE.Vector3, team: number, spellFactory: spellFactory, direction: THREE.Vector3, spell: ConcreteSpell, interval: number, spawnPosition: THREE.Vector3}} params
     */
    constructor(params) {
        super(params);
        this.timer = 0;
        this.interval = params?.interval ?? 0.5;
        this.position = params?.position ?? new THREE.Vector3(0,0,0);
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
            this.dispatchEvent(this._createSpawnSpellEvent());
            this.timer = 0;
        }
    }

    /**
     * Create a spawn spell event
     * @returns {CustomEvent<{type, params: {position: Vector3, team: number, direction: Vector3}}>} - the spawn spell event
     * @private - helper function
     */
    _createSpawnSpellEvent() {
        return new CustomEvent("spawnSpell", {
            detail: {
                type: this.spell,
                params: {position: new THREE.Vector3(-7,35,-10), direction: new THREE.Vector3(10,-3,0).
                    add(new THREE.Vector3(Math.random()*4-2,-Math.random()*4,Math.random()*4-2)), team: 0}
            }
        });
    }
}
