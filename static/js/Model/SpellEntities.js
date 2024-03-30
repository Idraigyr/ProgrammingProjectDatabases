import {Entity} from "./Entity.js";
import * as THREE from "three";

/**
 * @class SpellEntity - represents a spell entity
 */
class SpellEntity extends Entity{
    constructor(params) {
        super(params);
        this.spellType = params.spellType;
        this.duration = params.duration;
        this.hitSomething = false;
        this.timer = 0;
    }

    /**
     * type of entity
     * @returns {String} - "spellEntity"
     */
    get type(){
        return "spellEntity";
    }
    /**
     * checks for Entity removal, potentially dispatches delete event
     * @param {number} deltaTime
     */
    update(deltaTime){
        this.timer += deltaTime;
        if(this.timer > this.duration){
            //cleanup and delete
            this.dispatchEvent(this.createDeleteEvent());
        }
    }

    onWorldCollision(){}
    onCharacterCollision(character){
        if(this.team !== character.team){
            this.spellType.applyEffects(character);
            this.hitSomething = true;
        }
    }
}

/**
 * @class Projectile - class for projectile spells. Determines how the spell collides with enemies
 */
export class Projectile extends SpellEntity{
    /**
     * ctor
     * @param {{direction: THREE.Vector3, velocity: number, fallOf: number}} params
     */
    constructor(params) {
        super(params);
        this.direction = params.direction;
        this.velocity = params.velocity;
        this.fallOf = params.fallOf;
    }
    /**
     * updates projectile (position, superclass.update) and dispatches updatePosition event
     * @param {number} deltaTime
     */
    update(deltaTime){
        super.update(deltaTime);
        const vec = new THREE.Vector3().copy(this.direction);
        vec.normalize();
        vec.multiplyScalar(this.velocity*deltaTime);
        this._position.add(vec);
        this.dispatchEvent(this._createUpdatePositionEvent());
    }

    onWorldCollision(){
        this.hitSomething = true;
        this.timer += this.duration;
        this.dispatchEvent(this.createDeleteEvent());
    }
    onCharacterCollision(character){
        super.onCharacterCollision(character);

        if(this.hitSomething) {
            this.timer += this.duration;
            this.dispatchEvent(this.createDeleteEvent());
        }
    }
}

export class Immobile extends SpellEntity{
    constructor(params) {
        super(params);
    }
    onWorldCollision(){
        super.onWorldCollision();
    }
    onCharacterCollision(character){
        super.onCharacterCollision(character);
    }
}

export class FollowPlayer extends SpellEntity{
    constructor(params) {
        super(params);
        this.target = params.target;
        this.offset = params?.offset ?? new THREE.Vector3(0,0,0);
    }
    update(deltaTime){
        super.update(deltaTime);
        this._position.copy(this.target._position);
        this.dispatchEvent(this._createUpdatePositionEvent());
    }
}
