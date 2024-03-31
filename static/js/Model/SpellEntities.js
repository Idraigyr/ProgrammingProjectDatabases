import {Entity} from "./Entity.js";
import * as THREE from "three";
import {min} from "../helpers.js";

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
    onCharacterCollision(character, characterBBox, spellBBox){
        if(this.team !== character.team){
            this.spellType.applyEffects(character);
            this.hitSomething = true;
        }
    }
}

class CollidableSpellEntity extends SpellEntity{
    constructor(params) {
        super(params);
        this.boundingBox = new THREE.Box3();
    }

    update(deltaTime) {
        super.update(deltaTime);
    }
}
//move function should be a function that takes a value and a position vector and returns a new position vector
//at this.functionValue = 0, the returned vector should always be (0,0,0)
export class MobileCollidable extends CollidableSpellEntity{
    constructor(params) {
        super(params);
        this.spawnPoint = new THREE.Vector3().copy(params.position);
        this.moveFunction = params.moveFunction;
        this.moveFunctionParams = params.moveFunctionParams;
        this.functionValue = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.functionValue += deltaTime;
        this.moveEntity();
    }
    moveEntity(){
        this.position = this.position.copy(this.spawnPoint).add(this.moveFunction(this.functionValue, this.moveFunctionParams));
    }

    onWorldCollision(){}
    onCharacterCollision(character, characterBBox, spellBBox){
        super.onCharacterCollision(character);

        // const hitVector = new THREE.Vector3().copy(spellBBox.getCenter(new THREE.Vector3())).sub(characterBBox.getCenter(new THREE.Vector3()));
        // const distance = hitVector.length();
        character.position = character.position.add(new THREE.Vector3().copy(this.moveFunction(this.functionValue, this.moveFunctionParams))).sub(new THREE.Vector3(0,character.radius,0));
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
    onCharacterCollision(character, characterBBox, spellBBox){
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
    onCharacterCollision(character, characterBBox, spellBBox){
        super.onCharacterCollision(character);
    }
}

export class RitualSpell extends SpellEntity{
    constructor(params) {
        super(params);
    }
    update(deltaTime){
        super.update(deltaTime);
        // TODO: add something here?
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
