import * as THREE from "three";
import {Spawner} from "./Spawner.js";


/**
 * @class SpellSpawner - class for spawning spells
 */
export class SpellSpawner extends Spawner{
    /**
     * ctor
     * @param {{position: THREE.Vector3, team: number, spellFactory: spellFactory, direction: THREE.Vector3, spell: ConcreteSpell, interval: number, spawnPosition: THREE.Vector3, collisionDetector: CollisionDetector}} params
     */
    constructor(params) {
        super(params);
        this.spell = params?.spell?.type ?? null;
        console.log("Spell of spellSpawner: ", this.spell)
        this.spellParams = params?.spell?.params ?? null;
        if(this.spellParams) this.spellParams.position = this.position.clone();
        this.nearestTarget = null; //TODO: remove?
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
        return (this.interval * this.speedMultiplier);
    }

    /**
     * Update the spawner
     * @param deltaTime - time since last update
     */
    update(deltaTime) {
        const {closestEnemy, closestDistance} = this.collisionDetector.getClosestEnemy(this, ["player", "character"]);
        if (closestEnemy && closestDistance < 150) //TODO: make the range a parameter (in config file?)
        {
            this.timer += deltaTime;
            if(this.timer >= this.calculateSpeed() && this.spell) {
                const params = {...this.spellParams};
                params.damage = this.calculateDamage(this.spellParams.damage);
                const enemyPosition = closestEnemy.position;
                enemyPosition.y += Math.floor(closestEnemy.height/2);
                params.direction = new THREE.Vector3().subVectors(enemyPosition, this.position).normalize(); //Is randomness needed? Because the tower is slow enough to not be overpowered without it
                params.team = this.team;
                params.position = this.position.clone();
                //random offset
                // params.direction.add(new THREE.Vector3(Math.random() * 4 - 2, -Math.random() * 4, Math.random() * 4 - 2).normalize());
                console.log("Spawning spell");
                this.dispatchEvent(this._createSpawnEvent({
                    type: this.spell.constructor,
                    params: params
                }));
                this.timer = 0;
            }
        }
        else
        {
            this.timer = 0;
        }
    }
}
