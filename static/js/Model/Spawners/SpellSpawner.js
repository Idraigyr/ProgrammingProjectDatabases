import * as THREE from "three";
import {Spawner} from "./Spawner.js";
import {Fireball} from "../Spell.js";


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
        this.spell = params?.spell?.type ?? null;
        this.spellParams = params?.spell?.params ?? null;
        if(this.spellParams) this.spellParams.position = this.position.clone();
        this.nearestTarget = null;
        this.position = params?.position;
        this.damageMultiplier = params?.damage ?? 1;
        this.speedMultiplier = params?.speed ?? 1;
        this.collisionDetector = params?.collisionDetector;
        this.team = params?.team;
    }

    /**
     * Set the spell to spawn
     * @param type - the type of spell to spawn
     * @param params - the parameters of the spell
     */
    setSpell(type, params){
        this.spell = type;
        this.spellParams = params;
        this.spellParams.position = this.position.clone();
    }

    /**
     * Calculate the tower damage
     * @param base - the base damage
     */
    calculateDamage(base){
        return (base * this.damageMultiplier);
    }

    /**
     * Calculate the tower shooting speed (interval)
     */
    calculateSpeed() {
        return (this.interval / this.speedMultiplier);
    }

    /**
     * Update the spawner
     * @param deltaTime - time since last update
     */
    update(deltaTime) {
        this.timer += deltaTime;
        if(this.timer >= this.calculateSpeed() && this.spell){
            const params = {...this.spellParams};
            params.damage = this.calculateDamage(this.spellParams.damage);
            if(this.nearestTarget) {
                params.direction = new THREE.Vector3().subVectors(this.nearestTarget.position, this.position).normalize();
            } else {
                params.direction = new THREE.Vector3(Math.random()*4-2,-Math.random()*4,Math.random()*4-2).normalize();
            }
            //random offset
            params.direction.add(new THREE.Vector3(Math.random()*4-2,-Math.random()*4,Math.random()*4-2).normalize());
            this.dispatchEvent(this._createSpawnEvent({
                type: this.spell,
                params: params
            }));
            this.timer = 0;
        }
    }
}
