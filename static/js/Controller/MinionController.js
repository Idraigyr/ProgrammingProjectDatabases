import * as THREE from "three";
import {gridCellSize} from "../configs/ViewConfigs.js";
import {buildTypes} from "../configs/Enums.js";
import {printFoundationGrid, returnWorldToGridIndex} from "../helpers.js";
import {Foundation} from "../Model/Foundation.js";

//TODO: put this directly in grid of foundation?
class PathNode{
    constructor(params) {
        this.index = params.index;
        this.gCost = 0;
        this.hCost = 0;
        this.worldMap = params.worldMap;
    }

    get neighbours(){
        const neighbours = [];
        const cells = this.worldMap.getTraversableNeighbours(this.index);
        for(const cell of cells){
            neighbours.push(new PathNode({index: cell, worldMap: this.worldMap}));
        }
        return neighbours;
    }

    get fCost(){
        return this.gCost + this.hCost;
    }

}

export class MinionController{
    #worldMap;
    constructor(params) {
        this.minions = [];
        this.collisonDetector = params.collisionDetector;
        this.#worldMap = new Foundation({});
        this.parent = null;

        //TODO: use heap for open
        this.open = [];
        this.closed = [];
    }

    calculatePath(start, end){
        this.open = [];
        this.closed = [];

        this.open.push(start);

        while(this.open.length > 0){
            let current = this.open.reduce((acc, current) => current.fCost < acc.fCost ? current : (current.fCost === acc.fCost ? (current.hCost < acc.hCost ? current : acc) : acc));
            this.open = this.open.filter((node) => node !== current);
            this.closed.push(current);

            if(current === end){
                return;
            }

            for(const neighbour of current.neighbours){
                if(this.closed.includes(neighbour)){
                    continue;
                }

                if(current.getDistance(neighbour) < neighbour.f_cost || !this.open.includes(neighbour)){
                    neighbour.f_cost = current.getDistance(neighbour);
                    neighbour.parent = current;

                    if(!this.open.includes(neighbour)){
                        this.open.push(neighbour);
                    }
                }
            }

        }

    }

    set worldMap(islands){
        this.#worldMap.setFromFoundations(islands);
        console.log(this.#worldMap.position);
        printFoundationGrid(this.#worldMap.grid, this.#worldMap.width, this.#worldMap.length)
    }

    get worldMap(){
        return this.#worldMap.slice();
    }

}