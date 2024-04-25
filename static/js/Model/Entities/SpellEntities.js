import {Entity} from "./Entity.js";
import * as THREE from "three";
import {adjustVelocity, adjustVelocity2, adjustVelocity3, launchCollidedObject} from "../../helpers.js";
import {Minion} from "./Characters/Minion.js";

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

    onWorldCollision(deltaTime){}
    /**
     * Function to handle collision with characters
     * @param deltaTime - time since last update
     * @param character - character to check collision with
     */
    onCharacterCollision(deltaTime, character){
        if(this.team !== character.team){
            this.spellType.applyEffects(character);
            this.hitSomething = true;
            character.hit = true;
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

    /**
     * updates the entity
     * @param deltaTime
     */
    update(deltaTime) {
        super.update(deltaTime);
        this.functionValue += deltaTime;
        this.moveEntity();
    }

    /**
     * Moves the entity according to the moveFunction
     */
    moveEntity(){
        this.position = this.position.copy(this.spawnPoint).add(this.moveFunction(this.functionValue, this.moveFunctionParams));
    }
    /**
     * Function to handle collision with world
     * @param deltaTime - time since last update
     */

    onWorldCollision(deltaTime){}
    /**
     * Function to handle collision with characters
     * @param deltaTime - time since last update
     * @param character - character to check collision with
     * @param characterBBox - bounding box of character
     * @param spellBBox - bounding box of spell
     */
    onCharacterCollision(deltaTime, character, characterBBox, spellBBox){
        super.onCharacterCollision(deltaTime, character);

        character.onCollidable = adjustVelocity2(spellBBox, characterBBox, character.velocity, deltaTime);
        //TODO: make sure player rises with the collidable
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

    /**
     * Function to handle collision with world
     * @param deltaTime - time since last update
     */
    onWorldCollision(deltaTime){
        this.hitSomething = true;
        this.timer += this.duration;
        this.dispatchEvent(this.createDeleteEvent());
    }

    /**
     * Function to handle collision with characters
     * @param deltaTime - time since last update
     * @param character - character to check collision with
     * @param characterBBox - bounding box of character
     * @param spellBBox - bounding box of spell
     */
    onCharacterCollision(deltaTime, character, characterBBox, spellBBox){
        super.onCharacterCollision(deltaTime, character);

        if(this.hitSomething) {
            launchCollidedObject(spellBBox, characterBBox, this.velocity, character.velocity, 1, 20, deltaTime);
            this.timer += this.duration;
            this.dispatchEvent(this.createDeleteEvent());
        }
    }
}

/**
 * @class Immobile - class for immobile spells
 */
export class Immobile extends SpellEntity{
    constructor(params) {
        super(params);
    }
    /**
     * Function to handle collision with world
     * @param deltaTime - time since last update
     */
    onWorldCollision(deltaTime){
        super.onWorldCollision(deltaTime);
    }
    /**
     * Function to handle collision with characters
     * @param deltaTime - time since last update
     * @param character - character to check collision with
     * @param characterBBox - bounding box of character
     * @param spellBBox - bounding box of spell
     */
    onCharacterCollision(deltaTime, character, characterBBox, spellBBox){
        super.onCharacterCollision(deltaTime, character);
    }
}

/**
 * @class RitualSpell - class for ritual spells
 */
export class RitualSpell extends SpellEntity{
    constructor(params) {
        super(params);
    }
    update(deltaTime){
        super.update(deltaTime);
        // TODO: add something here?
    }
}

/**
 * @class FollowPlayer - class for entities that follow the player
 */
export class FollowPlayer extends SpellEntity{
    constructor(params) {
        super(params);
        this.target = params.target;
        this.offset = params?.offset ?? new THREE.Vector3(0,0,0);
    }
    update(deltaTime){
        super.update(deltaTime);
        this._position.copy(this.target.position);
        this.dispatchEvent(this._createUpdatePositionEvent());
    }
}
