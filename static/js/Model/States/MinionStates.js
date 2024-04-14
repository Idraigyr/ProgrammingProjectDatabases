import {State} from "../../Patterns/State.js";

export class MinionState extends State{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = false;
    }
    updateState(deltaTime, input){

    }

    enter(prevState){}

    exit(){}
}

export class MinionIdleState extends MinionState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = true;
    }

    get name(){
        return "Idle";
    }
    updateState(deltaTime, input){
        if(input.currentNode){
            this.manager.setState("WalkForward");
        }
    }

    /**
     * Enter the state (with crossfade from previous state)
     * @param prevState previous state
     */
    enter(prevState){
        const curAction = this.manager.animations["Idle"];
        if(prevState){
            const prevAction = this.manager.animations[prevState.name];

            curAction.time = 0.0;
            curAction.enabled = true;
            curAction.setEffectiveTimeScale(1.0);
            curAction.setEffectiveWeight(1.0);

            //possible necessary logic

            curAction.crossFadeFrom(prevAction,0.5,true);
            curAction.play();
        } else {
            curAction.play();
        }
    }
}

export class MinionWalkForwardState extends MinionState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = true;

    }

    get name(){
        return "WalkForward";
    }
    updateState(deltaTime, input){
        // this.manager.setState("Idle");
    }

    /**
     * Enter the state (with crossfade from previous state)
     * @param prevState previous state
     */
    enter(prevState){
        const curAction = this.manager.animations["WalkForward"];
        if(prevState){
            const prevAction = this.manager.animations[prevState.name];

            curAction.time = 0.0;
            curAction.enabled = true;
            curAction.setEffectiveTimeScale(1.0);
            curAction.setEffectiveWeight(1.0);

            //possible necessary logic

            curAction.crossFadeFrom(prevAction,0.5,true);
            curAction.play();
        } else {
            curAction.play();
        }
    }
}

export class MinionWalkBackwardState extends MinionState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = true;
    }

    get name(){
        return "WalkBackward";
    }
    updateState(deltaTime, input){
        this.manager.setState("Idle");
    }
}

export class MinionDefaultAttackState extends MinionState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = false;
    }

    get name(){
        return "DefaultAttack";
    }
    updateState(deltaTime, input){
        this.manager.setState("Idle");
    }
}