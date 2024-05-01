import {State} from "../../Patterns/State.js";

export class MinionState extends State{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = false;
    }

    /**
     * Name of the state
     * @param deltaTime time since last frame
     * @param input input from user
     */
    updateState(deltaTime, input){

    }

    /**
     * Enter the state
     * @param prevState previous state
     */

    enter(prevState){}

    /**
     * Exit the state
     */
    exit(){}
}

/**
 * Minion Idle State
 */
export class MinionIdleState extends MinionState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = true;
    }

    /**
     * Name of the state
     * @returns {string}
     */
    get name(){
        return "Idle";
    }

    /**
     * Update the state
     * @param deltaTime time since last frame
     * @param input input from user
     */
    updateState(deltaTime, input){
        if(input.currentNode){
            this.manager.setState("WalkForward");
        }
    }

    processEvent(event) {
        switch (event.detail.newState) {
            case "WalkForward":
                this.manager.setState("WalkForward");
                break;
            case "DefaultAttack":
                this.manager.setState("DefaultAttack");
                break;
            default:
                break;
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

/**
 * Minion Walk Forward State
 */
export class MinionWalkForwardState extends MinionState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = true;

    }

    /**
     * Name of the state
     * @returns {string}
     */
    get name(){
        return "WalkForward";
    }

    /**
     * Update the state
     * @param deltaTime time since last frame
     * @param input input from user
     */
    updateState(deltaTime, input){
        // this.manager.setState("Idle");
    }

    processEvent(event) {
        switch (event.detail.newState) {
            case "Idle":
                this.manager.setState("Idle");
                break;
            case "DefaultAttack":
                this.manager.setState("DefaultAttack");
                break;
            default:
                break;
        }
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

/**
 * Minion Walk Backward State
 */
export class MinionWalkBackwardState extends MinionState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = true;
    }

    /**
     * Name of the state
     * @returns {string} name of the state
     */
    get name(){
        return "WalkBackward";
    }

    /**
     * Update the state
     * @param deltaTime time since last frame
     * @param input input from user
     */
    updateState(deltaTime, input){
        this.manager.setState("Idle");
    }
}

/**
 * Minion Attack State
 */
export class MinionDefaultAttackState extends MinionState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = false;
    }

    /**
     * Name of the state
     * @returns {string} name of the state
     */
    get name(){
        return "DefaultAttack";
    }
    updateState(deltaTime, input){
        this.manager.setState("Idle");
    }

    processEvent(event) {
        switch (event.detail.newState) {
            case "Idle":
                this.manager.setState("Idle");
                break;
            case "WalkForward":
                this.manager.setState("WalkForward");
                break;
            default:
                break;
        }
    }

    /**
     * Enter the state (with crossfade from previous state)
     * @param prevState previous state
     */
    enter(prevState){
        const curAction = this.manager.animations["DefaultAttack"];
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