import {
    DefaultAttackState,
    IdleState,
    RunForwardState, TakeDamageState,
    WalkBackWardState,
    WalkForwardState
} from "../Model/States/CharacterStates.js";

class FiniteStateMachine{
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

export class PlayerFSM extends FiniteStateMachine{
    constructor(animations) {
        super();
        this.init();
        this.animations = animations;
        this.currentState = new IdleState(this);
    }
    init(){
        this.addState("Idle",IdleState);
        this.addState("WalkForward",WalkForwardState);
        this.addState("WalkBackward",WalkBackWardState);
        this.addState("DefaultAttack",DefaultAttackState);
        this.addState("Run",RunForwardState);
        this.addState("TakeDamage",TakeDamageState);
    }
}