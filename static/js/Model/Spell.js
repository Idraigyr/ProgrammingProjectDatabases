//abstract classes
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
    constructor() {
        super();
        this.duration = 0;
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

    applyEffects(target){
        this.effects.forEach((effect) => effect.apply(target));
    }
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
                    damage: 0
            }), new DoT({
                    damage: 0,
                    interval: 0,
                    duration: 0
            })]
        });
        this.name = "fireball";
        this.cost = 5;
    }
}

/**
 * @class Zap - class for zap spell
 */
export class Zap extends ConcreteSpell{
    constructor() {
        super({
            spell: new InstantSpell(),
            effects: [new InstantDamage()]
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
                cooldown: 1.34, //TODO: need animations that last equally long
                castTime: 0,
            }),
            effects: [new InstantDamage({
                damage: 0
            })]
        });
        this.name = "thundercloud";
        this.hasPreview = true;
        this.worldHitScan = true;
        this.cost = 20;
    }
}

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
    }
}

/**
 * @class Heal - class for heal spell
 */
class Heal extends ConcreteSpell{
    constructor() {
        super({
            spell: new InstantSpell(),
            effects: [new HealEffect()]
        });
    }
}
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