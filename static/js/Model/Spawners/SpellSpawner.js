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
        this.spell = params?.spell?.type;
        this.spellParams = params?.spell?.params;
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
    }

    /**
     * Calculate the tower damage
     */
    calculateDamage(){
        return (15 * this.damageMultiplier);
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
        const {closestEnemy, closestDistance} = this.collisionDetector.getClosestEnemy(this);
        if (closestEnemy != null && closestDistance < 500) //TODO: make the range a parameter (in config file?)
           {
            this.timer += deltaTime;
            if(this.timer >= this.calculateSpeed()) {
                this.dispatchEvent(this._createSpawnEvent({
                    type: this.spell,
                    position: this.position,
                    direction: closestEnemy.position.add(new THREE.Vector3(Math.random() * 4 - 2, -Math.random() * 4, Math.random() * 4 - 2)),
                    team: this.team
                }));
                console.log("spawned fireball");


                this.timer = 0;
            }
        }
        else {
            this.timer = 0;
        }
    }
}
