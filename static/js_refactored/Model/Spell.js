//abstract classes
/**
 * @class Spell - abstract class for all spells
 */
class Spell{
    constructor(params) {
        this.duration = params.duration;
        this.castTime = params.castTime;
        this.cooldown = params.cooldown;
        this.timer = 0;
    }

    /**
     * Updates the spell
     * @param deltaTime - time since last update
     */
    update(deltaTime){
        this.timer += deltaTime;
        if(this.timer > this.duration){
            //cleanup and delete
        }
    }
}

/**
 * @class EntitySpell - abstract class for spells with entities
 */
class EntitySpell extends Spell{
    constructor(params) {
        super(params);
    }
    update(deltaTime){

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
        this.area = params.area;
    }
    update(deltaTime){

    }
}

/**
 * @class Hitscan - class for hitscan spells
 */
class HitScan extends Spell{
    constructor(params) {
        super(params);
        this.duration = 0;
    }
}

/**
 * @class InstantSpell - class for instant spells
 */
class InstantSpell extends Spell{
    constructor() {
        super();
        this.duration = 0;
    }

}
/**
 * @class Effect - abstract class for all effects (second component of spell)
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
class Shield extends Effect{
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
        this.spell = params.spell;
        this.effects = params.effects;
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
}

/**
 * @class BuildSpell - class for building spells
 */
export class BuildSpell extends ConcreteSpell{
    // TODO: change this
    constructor(params) {
        super({
            spell: new HitScan({
                duration: 0,
                cooldown: 0,
                castTime: 0,
            }),
            effects: [
                new Build({
                    building: "Tree"
                })
            ]
        });
    }
}

/**
 * @class Fireball - class for fireball spells
 */
export class Fireball extends ConcreteSpell{
    constructor(params) {
        super({
            spell: new Projectile({
                duration: 5,
                cooldown: 1.34, //TODO: need animations that last equally long
                castTime: 0,
                velocity: 10,
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
    }
}

/**
 * @class Zap - class for zap spells
 */
export class Zap extends ConcreteSpell{
    constructor() {
        super({
            spell: new InstantSpell(),
            effects: [new InstantDamage()]
        });
    }
}

/**
 * @class Thunder - class for thunder spells
 */
class ThunderCloud extends ConcreteSpell{
    constructor() {
        super({
            spell: new Cloud(),
            effects: [new InstantDamage()]
        });
    }
}

/**
 * @class Heal - class for heal spells
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


//use dependency injection pattern?