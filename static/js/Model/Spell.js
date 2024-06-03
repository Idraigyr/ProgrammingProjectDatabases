//abstract classes
import * as THREE from "three";
import * as spellConfig from "./../configs/SpellConfigs.js"

/**
 * @class Spell - abstract class for all spells (first component of ConcreteSpell)
 */
class Spell{
    constructor(params) {
        this.duration = params.duration;
        this.castTime = params.castTime;
        this.cooldown = params.cooldown;
    }

    /**
     * Updates the spell
     * @param deltaTime - time since last update
     */
    update(deltaTime){
    }
}

/**
 * @class EntitySpell - abstract class for spells with entities
 */
export class EntitySpell extends Spell{
    constructor(params) {
        super(params);
    }
    update(deltaTime){

    }
}

/**
 * @class Follower - class for follower spells. Determines how the spell follows the caster
 */
class Follower extends EntitySpell{
    constructor(params) {
        super(params);
        this.offset = params.offset;
    }
}

/**
 * @class Projectile - class for projectile spells. Determines how the spell collides with enemies
 */
class Projectile extends EntitySpell{
    constructor(params) {
        super(params);
        this.velocity = params.velocity;
        this.fallOf = params.fallOf;
    }
    update(deltaTime){
    }
}

/**
 * @class Cloud - class for cloud spells
 */
class Cloud extends EntitySpell{
    constructor(params) {
        super(params);
    }
    update(deltaTime){

    }
}

/**
 * Functions to determine the movement of the spell
 * @type {{linear: (function(*, *): Vector3), sinX: (function(*, *): Vector3), sinZ: (function(*, *): Vector3), minLinearY: (function(*, *): Vector3)}} - moveFunctions
 */
const moveFunctions = {
    linear: function (value, params) {
        return new THREE.Vector3(0, 0, value);
    },
    minLinearY: function (value, params) {
        return new THREE.Vector3(0, Math.min(params.maxY, value*params.speed), 0);
    },
    sinZ: function (value, params) {
        return new THREE.Vector3(0, 0, Math.sin(value*params.frequency  + params.horizontalOffset)*params.amplitude - params.verticalOffset);
    },
    sinX: function (value, params) {
        return new THREE.Vector3(Math.sin(value*params.frequency  + params.horizontalOffset)*params.amplitude - params.verticalOffset, 0, 0);
    }
}

const moveFunctionParams = {
    linear: {},
    minLinearY: {maxY: 5, speed: 6},
    sinZ: {frequency: 1, amplitude: 1, horizontalOffset: 0, verticalOffset: 0},
    sinX: {frequency: 1, amplitude: 1, horizontalOffset: 0, verticalOffset: 0}
}

class Block extends EntitySpell{
    constructor(params) {
        super(params);
        this.moveFunction = moveFunctions.minLinearY;
        this.moveFunctionParams = moveFunctionParams.minLinearY;
    }
    update(deltaTime){

    }

}

/**
 * @class Hitscan - class for hitscan spells
 */
export class HitScanSpell extends Spell{
    constructor(params) {
        super(params);
        this.duration = 0;
    }
}

/**
 * @class InstantSpell - class for instant spells
 */
export class InstantSpell extends Spell{
    constructor(params) {
        params.duration = 0;
        super(params);
    }

}
/**
 * @class Effect - abstract class for all effects (second component of ConcreteSpell)
 */
class Effect{
    constructor(params) {
    }

    /**
     * Applies the effect to the target
     * @param target - the target of the effect
     */
    apply(target){

    }
}

/**
 * @class InstantDamage - class for instant damage effects
 */
class InstantDamage extends Effect{
    constructor(params) {
        super(params);
        this.damage = params.damage;
    }

    /**
     * Applies the effect to the target
     * @param target - the target of the effect
     */
    apply(target){
        target.takeDamage(this.damage)
    }
}

/**
 * @class DoT - class for damage over time effects
 */
class DoT extends Effect{
    constructor(params) {
        super(params);
        this.damage = params.damage;
        this.interval = params.interval;
        this.duration = params.duration;
    }

}

/**
 * @class HealEffect - class for healing effects
 */
class HealEffect extends Effect{
    constructor() {
        super();
    }

}

/**
 * @class Shield - class for shield effects
 */
class ShieldEffect extends Effect{
    constructor() {
        super();
    }

}

/**
 * @class Build - class for building effects
 */
class Build extends Effect{
    constructor(params) {
        super(params);
        this.building = params.building;
    }
}

/**
 * @class ConcreteSpell - class for concrete spells
 */
class ConcreteSpell{
    constructor(params) {
        this.hasPreview = false;
        this.previewRotates = false;
        this.worldHitScan = false;
        this.EntityHitScan = false;
        this.goesThroughWalls = false;
        this.charger = false;
        this.cost = 0;
        this.spell = params.spell;
        this.effects = params.effects;
        this.name = "null";
    }

    /**
     * Get cooldown of the spell
     * @returns {number|*}
     */
    getCooldown(){
        return this.spell.cooldown;
    }

    /**
     * Update the spell and apply effects to targets
     * @param deltaTime
     */
    update(deltaTime){
        let targets = this.spell.update(deltaTime);
        if(targets){
            targets.forEach((target) => this.effects.forEach((effect) => effect.apply(target)));
        }
    }

    updateParams(params){

    }

    /**
     * Apply effects to the target
     * @param target - the target of the effects
     */
    applyEffects(target){
        this.effects.forEach((effect) => effect.apply(target));
    }

    /**
     * Apply harmless effects to the target (harmless = no influence on health)
     * @param target
     */
    applyHarmlessEffects(target){
        this.effects.filter((effect) => !effect.damage).forEach((effect) => effect.apply(target));

    }

    /**
     * update the spell attributes
     * @param level
     */
    updateSpell(level){}
}

/**
 * @class BuildSpell - class for building spell
 */
export class BuildSpell extends ConcreteSpell{
    // TODO: change this
    constructor(params) {
        super({
            spell: new HitScanSpell({
                duration: 0,
                cooldown: 1,
                castTime: 0,
            }),
            effects: [
                new Build({
                    building: "Tree"
                })
            ]
        });
        this.hasPreview = true;
        this.worldHitScan = true;
        this.name = "build";
        this.cost = 10;
    }
}

/**
 * @class Fireball - class for fireball spell
 */
export class Fireball extends ConcreteSpell{
    constructor(params) {
        super({
            spell: new Projectile({
                duration: 10,
                cooldown: 1.34, //TODO: need animations that last equally long
                castTime: 0,
                velocity: params?.velocity ?? 20,
                fallOf: 0
            }),
            effects: [
                new InstantDamage({
                    damage: 50
            }), new DoT({
                    damage: 0,
                    interval: 0,
                    duration: 0
            })]
        });
        this.name = "fireball";
        this.cost = 5;
    }

    /**
     * update the spell attributes
     * @param level
     */
    updateSpell(level) {
        this.spell.duration = spellConfig.Fireball(level).duration;
        this.spell.cooldown = spellConfig.Fireball(level).cooldown;
        this.cost = spellConfig.Fireball(level).cost;
        this.spell.castTime = spellConfig.Fireball(level).castTime;
        this.spell.velocity = spellConfig.Fireball(level).velocity;
        this.spell.fallOf = spellConfig.Fireball(level).fallOf;
        this.effects[0].damage = spellConfig.Fireball(level).damage;
    }
}

/**
 * @class IceWall - class for icewall spell
 */
export class IceWall extends ConcreteSpell{
    constructor() {
        super({
            spell: new Block({
                duration: 20,
                cooldown: 0,
                castTime: 0,
            }),
            effects: [new Build({
                building: "IceWall"
            })]
        });
        this.name = "icewall";
        this.hasPreview = true;
        this.previewRotates = true;
        this.worldHitScan = true;
        this.cost = 20;
    }

    /**
     * update the spell attributes
     * @param level
     */
    updateSpell(level) {
        this.spell.duration = spellConfig.IceWall(level).duration;
        this.spell.cooldown = spellConfig.IceWall(level).cooldown;
        this.cost = spellConfig.IceWall(level).cost;
        this.spell.castTime = spellConfig.IceWall(level).castTime;
    }
}

/**
 * @class Zap - class for zap spell
 */
export class Zap extends ConcreteSpell{
    constructor() {
        super({
            spell: new InstantSpell({}),
            effects: [new InstantDamage({})]
        });
        this.name = "zap";
        this.worldHitScan = true;
    }
}

/**
 * @class ThunderCloud - class for thundercloud spell
 */
export class ThunderCloud extends ConcreteSpell{
    constructor() {
        super({
            spell: new Cloud({
                duration: 20,
                cooldown: 0, //TODO: need animations that last equally long
                castTime: 0,
            }),
            effects: [new InstantDamage({
                damage: 10 //adjust when balancing the game
            })]
        });
        this.name = "thundercloud";
        this.hasPreview = true;
        this.worldHitScan = true;
        this.cost = 20;
    }

    /**
     * update the spell attributes
     * @param level
     */

    updateSpell(level) {
        this.spell.duration = spellConfig.ThunderCloud(level).duration;
        this.spell.cooldown = spellConfig.ThunderCloud(level).cooldown;
        this.cost = spellConfig.ThunderCloud(level).cost;
        this.spell.castTime = spellConfig.ThunderCloud(level).castTime;
        this.effects[0].damage = spellConfig.ThunderCloud(level).damage;
    }
}

/**
 * @class Shield - class for shield spell
 */
export class Shield extends ConcreteSpell{
    constructor() {
        super({
            spell: new Follower({
                duration: 10,
                cooldown: 10, //TODO: need animations that last equally long
                castTime: 0,
                offset: null
            }),
            effects: [new ShieldEffect({
                damage: 0
            })]
        });
        this.cost = 15;
        this.name = "shield";
    }

    /**
     * Update the spell with attributes
     * @param level
     */
    updateSpell(level) {
        this.spell.duration = spellConfig.Shield(level).duration;
        this.spell.cooldown = spellConfig.Shield(level).cooldown;
        this.cost = spellConfig.Shield(level).cost;
        this.spell.castTime = spellConfig.Shield(level).castTime;
        this.effects[0].damage = spellConfig.Shield(level).damage;
    }
}

/**
 * @class Heal - class for heal spell
 */
class Heal extends ConcreteSpell{
    constructor() {
        super({
            spell: new InstantSpell({}),
            effects: [new HealEffect({})]
        });
    }
}

export const spellTypes = (() => {
    const spellObject = {
        Fireball: new Fireball({}),
        IceWall: new IceWall({}),
        Zap: new Zap({}),
        ThunderCloud: new ThunderCloud({}),
        Shield: new Shield({}),
        Heal: new Heal({}),
        BuildSpell: new BuildSpell({})
    }

    const ctors = {
        Fireball: Fireball,
        IceWall: IceWall,
        Zap: Zap,
        ThunderCloud: ThunderCloud,
        Shield: Shield,
        Heal: Heal,
        BuildSpell: BuildSpell
    }

    const names = {
        0: "BuildSpell",
        1: "Fireball",
        2: "IceWall",
        3: "Zap",
        4: "ThunderCloud",
        5: "Shield",
        6: "Heal"
    }

    const ids = {
        BuildSpell: 0,
        Fireball: 1,
        IceWall: 2,
        Zap: 3,
        ThunderCloud: 4,
        Shield: 5,
        Heal: 6
    }

    const icons = {
        Fireball: "./static/assets/images/spells/type2/Fireball.png",
        IceWall: "./static/assets/images/spells/type2/IceWall.png",
        Zap: "./static/assets/images/spells/type1/ThunderCloud.png",
        ThunderCloud: "./static/assets/images/spells/type2/ThunderCloud.png",
        Shield: "./static/assets/images/spells/type2/Shield.png",
        Heal: "./static/assets/images/spells/type1/Heal.png",
        BuildSpell: "./static/assets/images/spells/type2/BuildSpell.png"
    }

    return {
        getCtor(name) {
            return ctors[name];
        },

        getSpellObject: function (name) {
            return spellObject[name];
        },

        getSpellObjectFromId: function (id) {
            return spellObject[names[id]];
        },

        getName(id) {
            return names[id];
        },

        getId(name) {
            return ids[name];
        },

        getIcon: function (name) {
            return icons[name];
        },

        getNamesList: function () {
            return Object.keys(ids);
        }
    }
})();
//spell ideas:
//summon minion (self-explanatory)
//heal over time (self-explanatory)
//leap (jump high into the air)
//teleport (teleport a short distance)
// gravity star ( pulls targets into star)
// push (pushes a target away)
// pull (pulls a target toward you)
// shield (shields a target for x hp)
// ice wall (creates an ice wall)
// freeze ray (slow down targets)
// confusion ball (inverts movement)
// digging spell (move underground, becoming immune and leave a trail of dirt where you travel)
// sword spell (shoot an array of swords)


//use dependency injection pattern?