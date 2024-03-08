import {
    DefaultAttackState,
    IdleState,
    RunForwardState, TakeDamageState,
    WalkBackWardState,
    WalkForwardState
} from "../Model/States/CharacterStates.js";

export class FiniteStateMachine{
    #states = {};
    constructor() {
        this.currentState = null;
    }
    updateState(deltaTime, input){
        if(!this.currentState) return;
        this.currentState.updateState(deltaTime, input);
    }
    setState(name){
        const prevState = this.currentState
        if(prevState && prevState.name === name){
            if(prevState.name === name) return;
            prevState.exit();
        }

        this.currentState = new this.#states[name](this);
        this.currentState.enter(prevState);
    }
    addState(name, type){
        this.#states[name] = type;
    }
    init(){

    }
}