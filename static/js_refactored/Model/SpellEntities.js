import {Entity} from "./Entity.js";
import * as THREE from "three";

class SpellEntity extends Entity{
    constructor(params) {
        super(params);
        this.spellType = params.spellType;
        this.duration = params.duration;
    }

    get type(){
        return "spellEntity";
    }
}

export class Projectile extends SpellEntity{
    constructor(params) {
        super(params);
        this.direction = params.direction;
        this.velocity = params.velocity;
        this.fallOf = params.fallOf;
    }
    update(deltaTime){
        const vec = new THREE.Vector3().copy(this.direction);
        vec.multiplyScalar(this.velocity*deltaTime);
        this._position.add(vec);
        this.dispatchEvent(this._createUpdatePositionEvent());
    }
}
