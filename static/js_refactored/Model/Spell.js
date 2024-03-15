//abstract classes
class Spell{
    constructor(params) {
        this.duration = params.duration;
        this.castTime = params.castTime;
        this.cooldown = params.cooldown;
        this.timer = 0;
    }
    update(deltaTime){
        this.timer += deltaTime;
        if(this.timer > this.duration){
            //cleanup and delete
        }
    }
}
class EntitySpell extends Spell{
    constructor(params) {
        super(params);
    }
    update(deltaTime){

    }
}

//determines how the spell collides with enemies;
class Projectile extends EntitySpell{
    constructor(params) {
        super(params);
        this.velocity = params.velocity;
        this.fallOf = params.fallOf;
    }
    update(deltaTime){
    }
}

class Cloud extends EntitySpell{
    constructor(params) {
        super(params);
        this.area = params.area;
    }
    update(deltaTime){

    }
}

class HitScan extends Spell{
    constructor(params) {
        super(params);
        this.duration = 0;
    }
}

class InstantSpell extends Spell{
    constructor() {
        super();
        this.duration = 0;
    }

}

// Effects of spell (second component of spell)

class Effect{
    constructor(params) {
    }

    apply(target){

    }
}

class InstantDamage extends Effect{
    constructor(params) {
        super(params);
        this.damage = params.damage;
    }
}

class DoT extends Effect{
    constructor(params) {
        super(params);
        this.damage = params.damage;
        this.interval = params.interval;
        this.duration = params.duration;
    }

}

class HealEffect extends Effect{
    constructor() {
        super();
    }

}

class Shield extends Effect{
    constructor() {
        super();
    }

}

class Build extends Effect{
    constructor(params) {
        super(params);
        this.building = params.building;
    }
}
class ConcreteSpell{
    constructor(params) {
        this.spell = params.spell;
        this.effects = params.effects;
    }
    getCooldown(){
        return this.spell.cooldown;
    }
    update(deltaTime){
        let targets = this.spell.update(deltaTime);
        if(targets){
            targets.forEach((target) => this.effects.forEach((effect) => effect.apply(target)));
        }
    }
}

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
                    building: "tree"
                })
            ]
        });
    }
}

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

export class Zap extends ConcreteSpell{
    constructor() {
        super({
            spell: new InstantSpell(),
            effects: [new InstantDamage()]
        });
    }
}

class ThunderCloud extends ConcreteSpell{
    constructor() {
        super({
            spell: new Cloud(),
            effects: [new InstantDamage()]
        });
    }
}

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