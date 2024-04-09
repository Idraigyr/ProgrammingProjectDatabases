import {Fireball} from "./Spell.js";
import * as THREE from "three";
import {Subject} from "../Patterns/Subject.js";

export class SpellSpawner extends Subject{
    /**
     * ctor
     * @param {{position: THREE.Vector3, team: number, spellFactory: spellFactory, direction: THREE.Vector3, spell: ConcreteSpell, interval: number, spawnPosition: THREE.Vector3}} params
     */
    constructor(params) {
        super(params);
        this.timer = 0;
        this.interval = params?.interval ?? 0.5;
        this.position = params?.position ?? new THREE.Vector3(0,0,0);
        this.spell = params?.spell?.type;
        this.spellParams = params?.spell?.params;
    }

    setSpell(type, params){
        this.spell = type;
        this.spellParams = params;
    }

    update(deltaTime) {
        this.timer += deltaTime;
        if(this.timer >= this.interval && this.spell){
            this.dispatchEvent(this._createSpawnSpellEvent());
            this.timer = 0;
        }
    }

    _createSpawnSpellEvent() {
        return new CustomEvent("spawnSpell", {
            detail: {
                type: this.spell,
                params: {position: new THREE.Vector3(-7,35,-10), direction: new THREE.Vector3(10,-3,0).
                    add(new THREE.Vector3(Math.random()*4-2,-Math.random()*4,Math.random()*4-2)), team: 0}
            }
        });
    }
}
