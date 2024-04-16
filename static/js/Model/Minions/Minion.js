import * as THREE from "three";
import {Character} from "../Character.js";

/**
 * Class representing a Minion
 * @extends Character
 */
export class Minion extends Character{
    constructor(params) {
        super(params);
        this.tempPosition = this.spawnPoint.clone();
        this.lastMovementVelocity = new THREE.Vector3();
        this.input = {blockedInput: false, closestPlayer: null, closestTower: null, currentNode: null, currentNodeIndex: 0};
    }
}