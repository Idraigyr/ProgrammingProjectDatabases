//abstract classes
import * as THREE from "three";

class Spell{
    constructor(params) {
        this.duration = params.duration;
        this.cooldown = params.cooldown;
    }
}
class EntitySpell extends Spell{
    constructor(params) {
        super(params);
        this.duration = params.duration;
        this.cooldown = params.cooldown;
        this.position = params.position;
    }
    update(deltaTime){
        const vec = new THREE.Vector3().copy(this.direction);
        vec.multiplyScalar(this.velocity*deltaTime);
        this.position.add(vec);
    }
}

//movement type of spell (first component of spell)
class Projectile extends EntitySpell{
    constructor(params) {
        super(params);
        this.direction = params.direction;
        this.velocity = params.velocity;
        this.fallOf = params.fallOf;
    }
    update(deltaTime){
        const vec = new THREE.Vector3().copy(this.direction);
        vec.multiplyScalar(this.velocity*deltaTime);
        this.position.add(vec);
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
    constructor() {
        super();
        this.duration = 0;
    }
}

class Instant extends Spell{
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

}

class Heal extends Effect{

}

class Shield extends Effect{

}

class Fireball {
    constructor() {
        this.spell = new Projectile();
        this.effect = new Effect();
    }

    update(deltaTime){
        this.spell.update(deltaTime);
    }
}

//use dependency injection pattern?