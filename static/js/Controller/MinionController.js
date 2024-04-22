import * as THREE from "three";
import {gridCellSize} from "../configs/ViewConfigs.js";
import {buildTypes} from "../configs/Enums.js";
import {
    convertGridIndexToWorldPosition,
    printFoundationGrid,
    printGridPath,
    returnWorldToGridIndex
} from "../helpers.js";
import {Foundation} from "../Model/Foundation.js";
import {
    gravity
} from "../configs/ControllerConfigs.js";

//TODO: put this directly in grid of foundation?
/**
 * Class for a node in a path
 */
class PathNode{
    /**
     * PathNode constructor
     * @param {{index: number, value: *, position: THREE.Vector3, worldMap: Foundation}} params
     */
    constructor(params) {
        this.index = params.index;
        this.value = params.value;
        this.position = params?.position ?? new THREE.Vector3(); //TODO: set position (calculate from index and grid size and index of 0,0,0)
        this.gCost = 0;
        this.hCost = 0;
        this.worldMap = params.worldMap;
        this.parent = null;
    }

    /**
     * get neighbours of this node in the grid both direct and diagonally
     * @return {*[]}
     */
    get neighbours(){
        let neighbors = [];
        if(this.index % this.worldMap.width > 0 &&
            (this.worldMap.grid[this.index - 1].value === buildTypes.getNumber("empty") ||
                this.worldMap.grid[this.index - 1].value === buildTypes.getNumber("altar_building")) ) {
            neighbors.push(this.worldMap.grid[this.index - 1])
        } //has left neighbour
        if(this.index % this.worldMap.width < this.worldMap.width - 1 &&
            (this.worldMap.grid[this.index + 1].value === buildTypes.getNumber("empty") ||
                this.worldMap.grid[this.index + 1].value === buildTypes.getNumber("altar_building"))) {
            neighbors.push(this.worldMap.grid[this.index + 1])
        } //has right neighbour
        if(this.index >= this.worldMap.width &&
            (this.worldMap.grid[this.index - this.worldMap.width].value === buildTypes.getNumber("empty") ||
                this.worldMap.grid[this.index - this.worldMap.width].value === buildTypes.getNumber("altar_building"))) {
            neighbors.push(this.worldMap.grid[this.index - this.worldMap.width])
        } // has top neighbour
        if(this.index < this.worldMap.width*(this.worldMap.length - 1) &&
            (this.worldMap.grid[this.index + this.worldMap.width].value === buildTypes.getNumber("empty") ||
                this.worldMap.grid[this.index + this.worldMap.width].value === buildTypes.getNumber("altar_building"))) {
            neighbors.push(this.worldMap.grid[this.index + this.worldMap.width])
        } // has bottom neighbour
        if(this.index % this.worldMap.width > 0 && this.index >= this.worldMap.width &&
            (this.worldMap.grid[this.index - 1 - this.worldMap.width].value === buildTypes.getNumber("empty") ||
                this.worldMap.grid[this.index - 1 - this.worldMap.width].value === buildTypes.getNumber("altar_building"))){
            neighbors.push(this.worldMap.grid[this.index - 1 - this.worldMap.width]);
        } //top left
        if(this.index % this.worldMap.width < this.worldMap.width - 1 && this.index >= this.worldMap.width &&
            (this.worldMap.grid[this.index + 1 - this.worldMap.width].value === buildTypes.getNumber("empty") ||
                this.worldMap.grid[this.index + 1 - this.worldMap.width].value === buildTypes.getNumber("altar_building"))){
            neighbors.push(this.worldMap.grid[this.index + 1 - this.worldMap.width]);
        } //top right
        if(this.index % this.worldMap.width > 0 && this.index < this.worldMap.width*(this.worldMap.length - 1) &&
            (this.worldMap.grid[this.index - 1 + this.worldMap.width].value === buildTypes.getNumber("empty") ||
                this.worldMap.grid[this.index - 1 + this.worldMap.width].value === buildTypes.getNumber("altar_building"))){
            neighbors.push(this.worldMap.grid[this.index - 1 + this.worldMap.width]);
        } //bottom left
        if(this.index % this.worldMap.width < this.worldMap.width - 1 && this.index < this.worldMap.width*(this.worldMap.length - 1) &&
            (this.worldMap.grid[this.index + 1 + this.worldMap.width].value === buildTypes.getNumber("empty") ||
                this.worldMap.grid[this.index + 1 + this.worldMap.width].value === buildTypes.getNumber("altar_building"))){
            neighbors.push(this.worldMap.grid[this.index + 1 + this.worldMap.width]);
        } //bottom right
        return neighbors;
    }

    /**
     * get fCost of this node
     * @return {number}
     */
    get fCost(){
        return this.gCost + this.hCost;
    }

    /**
     * get distance to another node in the grid
     * @param node
     * @return {number}
     */
    getDistance(node){
        let x1 = this.index % this.worldMap.width;
        let z1 = Math.floor(this.index/this.worldMap.width);
        let x2 = node.index % this.worldMap.width;
        let z2 = Math.floor(node.index/this.worldMap.width);
        let dx = Math.abs(x1 - x2);
        let dz = Math.abs(z1 - z2);
        // return Math.abs(x1 - x2) + Math.abs(z1 - z2);
        return dx > dz ? 14*dz + 10*(dx - dz) : 14*dx + 10*(dz - dx);
    }

}

/**
 * Class for a minion controller
 */
export class MinionController{
    #worldMap;

    /**
     * MinionController constructor
     * @param {{collisionDetector: CollisionDetector}} params
     */
    constructor(params) {
        this.minions = [];
        this.collisionDetector = params.collisionDetector;
        this.#worldMap = new Foundation({});
        this.worldCenter = this.#worldMap.grid.length - 1 /2;

        //TODO: use heap for open
        this.open = [];
        this.closed = [];

        //paths per team per warrior hut
        this.paths = {0: {}, 1: {}};

    }

    /**
     * add a minion to the controller
     * @param {Minion} minion
     */
    addMinion(minion){
        this.minions.push(minion);
    }

    /**
     * update the physics of a minion
     * @param {Minion} minion
     * @param  {number} deltaTime
     */
    updateMinionPhysics(minion, deltaTime) {
        minion.velocity.y += deltaTime * gravity;

        minion.tempPosition.addScaledVector( minion.velocity, deltaTime );

        let deltaVector = this.collisionDetector.adjustCharacterPosition(minion, minion.tempPosition, deltaTime);

        if ( !minion.onGround ) {
            deltaVector.normalize();
            minion.velocity.addScaledVector( deltaVector, - deltaVector.dot( minion.velocity ) );
        } else {
            if(minion.input.blockedInput){
                minion.velocity.set(0,0,0);
            } else {
                minion.velocity.copy(minion.lastMovementVelocity);
            }
            minion.velocity.y = 0;
        }

        if ( minion.position.y < - 50 ) {
            //respawn TODO: kill minion if it falls of island?
            minion.velocity.set(0,0,0);
            minion.lastMovementVelocity.set(0,0,0);
            minion.position = minion.spawnPoint;
            minion.tempPosition.copy(minion.spawnPoint);

            minion.input.currentNode = this.paths[minion.team][0];
            minion.input.currentNodeIndex = 0;
        } else {
            minion.position = minion.tempPosition;
        }
    }

    /**
     * update the state of a minion
     * @param {Minion} minion
     * @param {number} deltaTime
     */
    updateMinion(minion, deltaTime){
        if (!minion.fsm.currentState || minion.input.blockedInput) {
            minion.fsm.setState("Idle");
            return;
        }

        minion.fsm.updateState(deltaTime, minion.input);
        //TODO: behaviour:
        // moves towards altar on path
        //what if collision with other minions? => test boxToBoxCollision (hold into account both velocities (and masses))
        //what if collision with player? => test boxToBoxCollision (hold into account both velocities (and masses))
        //what if collision with static geometry? => updateMinionPhysics
        // attacks player if close enough?
        //attacks tower if close enough? only if not more than 3 minions are already attacking it?
        //attacks altar if close enough

        if (minion.fsm.currentState.movementPossible) {

            //TODO: update movement based on state

            //walk towards altar:
            // set current target node that minion is moving towards
            if(!minion.input.currentNode) {
                minion.input.currentNode = this.paths[minion.team][0];
                minion.input.currentNodeIndex = 0;
            } //TODO: change indeces depending on starting position and team
            // if current target node is reached, set next target node
            if(minion.position.distanceTo(minion.input.currentNode.position) < 0.1){
                minion.input.currentNodeIndex++;
                if(minion.input.currentNodeIndex < this.paths[minion.team].length){
                    minion.input.currentNode = this.paths[minion.team][minion.input.currentNodeIndex];
                }
            }
            // rotate towards current node
            minion.phi = -new THREE.Vector3(1,0,0).angleTo(minion.input.currentNode.position.clone().sub(minion.position))*180/Math.PI;
            minion.rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), minion.phi*Math.PI/180);
            // move towards current node
            let movement = new THREE.Vector3(1, 0, 0);

            movement.subVectors(minion.input.currentNode.position, minion.position);

            movement.normalize();

            //if altar is close enough, attack altar
            //else if tower is close enough, attack tower
            //else if player is close enough, attack player
            const minionSpeedMultiplier = 800;
            minion.lastMovementVelocity.copy(movement).multiplyScalar(deltaTime*minionSpeedMultiplier);
            minion.velocity.copy(minion.verticalVelocity).add( minion.lastMovementVelocity);
        }
    }


    /**
     * update the physics of all minions
     * @param {number} deltaTime
     */
    updatePhysics(deltaTime){
        this.minions.forEach((minion) => this.updateMinionPhysics(minion, deltaTime));
    }

    /**
     * update the state of all minions
     * @param {number} deltaTime
     */
    update(deltaTime){
        this.minions.forEach((minion) => this.updateMinion(minion, deltaTime));
    }

    /**
     * calculate shortest path from start to end, should be called each time the worldMap changes
     * @param {PathNode} start - start node, needs to be in this.#worldMap.grid
     * @param {PathNode} end - end node, needs to be in this.#worldMap.grid
     */
    calculatePath(start, end){
        this.open = [];
        this.closed = [];

        this.open.push(start);

        while(this.open.length > 0){
            let current = this.open.reduce((acc, current) => current.fCost < acc.fCost ? current : (current.fCost === acc.fCost ? (current.hCost < acc.hCost ? current : acc) : acc));
            this.open = this.open.filter((node) => node !== current);
            this.closed.push(current);

            if(current === end){
                console.log("%cfound path", "color: green;");
                printGridPath(this.#worldMap.grid.map((node) => node.value), this.retracePath(start, current).map((node) => node.index), this.#worldMap.width, this.#worldMap.length, current.index);
                return this.retracePath(start, end);
            }

            for(const neighbour of current.neighbours){
                if(this.closed.includes(neighbour)){
                    continue;
                }

                const newMovementCostToNeighbour = current.gCost + current.getDistance(neighbour);

                if(newMovementCostToNeighbour < neighbour.gCost || !this.open.includes(neighbour)){
                    neighbour.gCost = newMovementCostToNeighbour;
                    neighbour.hCost = neighbour.getDistance(end);
                    neighbour.parent = current;

                    if(!this.open.includes(neighbour)){
                        this.open.push(neighbour);
                    }
                }
            }
            // printGridPath(this.#worldMap.grid.map((node) => node.value), this.retracePath(start, current).map((node) => node.index), this.#worldMap.width, this.#worldMap.length, current.index);

        }
        return null;

    }

    //TODO: move this?
    /**
     * calculate the position of a node in the grid from it's index
     * @param index
     * @return {THREE.Vector3}
     */
    calculateNodePosition(index){
        const position = new THREE.Vector3(index % this.#worldMap.width, 0, Math.floor(index/this.#worldMap.width));
        const {x,z} = convertGridIndexToWorldPosition(position);
        position.x = x + this.#worldMap.position.x - (this.#worldMap.width - 1)/2*gridCellSize;
        position.z = z + this.#worldMap.position.z - (this.#worldMap.length - 1)/2*gridCellSize;
        return position;
    }
    //TODO: move this?
    /**
     * calculate the index of a node in the grid from it's position
     * @param {THREE.Vector3} position
     * @return {*}
     */
    calculateIndexFromPosition(position){
        let {x,z} = returnWorldToGridIndex(position.sub(this.#worldMap.position));
        x += (this.#worldMap.width - 1)/2;
        z += (this.#worldMap.length - 1)/2;
        return z*this.#worldMap.width + x;
    }

    /**
     * set the worldMap of the controller from a list of Foundations nad calculate the paths (path is currently hardcoded to go from (-90,0,-80) to the center of the map)
     * @param {Foundation} islands
     */
    set worldMap(islands){
        this.#worldMap.setFromFoundations(islands);
        const centerIndex = islands[0].grid.length - 1 /2;
        printFoundationGrid(this.#worldMap.grid, this.#worldMap.width, this.#worldMap.length);

        //TODO: move this somewhere else? if placed in foundation you wouldn't need to calculate the position of the nodes more than once
        for(let i = 0; i < this.#worldMap.grid.length; i++){
            this.#worldMap.grid[i] = new PathNode({index: i, position: this.calculateNodePosition(i), value: this.#worldMap.grid[i], worldMap: this.#worldMap});
        }
        //TODO: temp solution
        if(islands.length > 1){
            // this.paths.push(
            //     this.calculatePath( //TODO: change indeces depending on starting position and team
            //         this.#worldMap.grid[this.calculateIndexFromPosition(new THREE.Vector3(-90,0,-80))],
            //         this.#worldMap.grid[Math.floor((this.#worldMap.grid.length-1)/2)] // this.#worldMap.grid.find((node) => node.value === buildTypes.getNumber("altar_building")) -> not used temporarily since broken db
            //     )
            // );
        }
    }

    /**
     * return a shallow copy of the worldMap
     * @return {*}
     */
    get worldMap(){
        return this.#worldMap.slice();
    }

    /**
     * retrace the path from end to start
     * @param {PathNode} start
     * @param {PathNode} end
     * @return {PathNode[]}
     */
    retracePath(start, end) {
        let path = [];
        let current = end;
        while(current !== start){
            path.push(current);
            current = current.parent;
        }
        path.reverse();
        return path;
    }
}