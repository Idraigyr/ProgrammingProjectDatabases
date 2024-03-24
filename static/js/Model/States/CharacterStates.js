import {State} from "../../Patterns/State.js";

/**
 * Class for the character state
 */
class BaseCharState extends State{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = false;
    }
    updateState(deltaTime, input){

    }

    enter(prevState){}

    exit(){}
}

/**
 * Idle state for the character
 */
export class IdleState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = true;
    }
    get name(){
        return "Idle"
    }

    /**
     * Update the state
     * @param deltaTime time passed since last update
     * @param input input from the user
     */
    updateState(deltaTime, input){
        if(input.keys.eating){
            this.manager.setState("Eating");
        } else if(input.keys.forward || input.keys.backward || input.keys.left || input.keys.right){
            if(input.keys.forward && input.keys.sprint){
                this.manager.setState("Run");
            } else if(input.keys.forward){
                this.manager.setState("WalkForward");
            } else if(input.keys.backward){
                this.manager.setState("WalkBackward");
            } else if(input.mouse.leftClick){
                this.manager.setState("DefaultAttack");
            } else {
                this.manager.setState("WalkForward");
            }
        } else if (input.keys.up){
            //this.manager.setState("Jump");
        } else if(input.mouse.leftClick){
            this.manager.setState("DefaultAttack");
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
 * Run state for the character
 */
export class RunForwardState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = true;
    }

    /**
     * Get the name of the state
     * @returns {string} name of the state
     */
    get name(){
        return "Run"
    }

    /**
     * Update the state
     * @param deltaTime time passed since last update
     * @param input input from the user
     */
    updateState(deltaTime, input){
        if(input.keys.forward || input.keys.backward || input.keys.left || input.keys.right){
            if(input.keys.eating){
                this.manager.setState("Eating");
            } else if((input.keys.forward || input.keys.left || input.keys.right) && !input.keys.sprint){
                this.manager.setState("WalkForward");
            } else if(input.keys.backward){
                this.manager.setState("WalkBackward");
            } else if(input.mouse.leftClick){
                this.manager.setState("DefaultAttack");
            }
        } else if (input.keys.up){
            //this.manager.setState("Jump");
        } else if(input.mouse.leftClick){
            this.manager.setState("DefaultAttack");
        } else if(input.keys.eating){
            this.manager.setState("Eating");
        } else {
            this.manager.setState("Idle");
        }
    }

    /**
     * Enter the state (with crossfade from previous state)
     * @param prevState previous state
     */
    enter(prevState){
        const curAction = this.manager.animations["Run"];
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
 * Walk forward state for the character
 */
export class WalkForwardState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = true;
    }

    /**
     * Get the name of the state
     * @returns {string} name of the state
     */
    get name(){
        return "WalkForward"
    }

    /**
     * Update the state
     * @param deltaTime time passed since last update
     * @param input input from the user
     */
    updateState(deltaTime, input){
        if(input.keys.eating){
            this.manager.setState("Eating");
        } else if(input.keys.forward || input.keys.backward || input.keys.left || input.keys.right){
            if(input.keys.forward && input.keys.sprint){
                this.manager.setState("Run");
            } else if(input.keys.backward){
                this.manager.setState("WalkBackward");
            } else if(input.mouse.leftClick){
                this.manager.setState("DefaultAttack");
            }
        } else if (input.keys.up){
            //this.manager.setState("Jump");
        } else if(input.mouse.leftClick){
            this.manager.setState("DefaultAttack");
        } else {
            this.manager.setState("Idle");
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
 * Walk backward state for the character
 */
export class WalkBackWardState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = true;
    }

    /**
     * Get the name of the state
     * @returns {string}
     */
    get name(){
        return "WalkBackward"
    }

    /**
     * Update the state
     * @param deltaTime time passed since last update
     * @param input input from the user
     */
    updateState(deltaTime, input){
        if(input.keys.eating){
            this.manager.setState("Eating");
        } else if(input.keys.forward || input.keys.backward || input.keys.left || input.keys.right){
            if(input.keys.forward && input.keys.sprint){
                this.manager.setState("Run");
            } else if(input.keys.forward){
                this.manager.setState("WalkForward");
            } else if(input.mouse.leftClick){
                this.manager.setState("DefaultAttack");
            }
        } else if (input.keys.up){
            //this.manager.setState("Jump");
        } else if(input.mouse.leftClick){
            this.manager.setState("DefaultAttack");
        } else {
            this.manager.setState("Idle");
        }
    }

    /**
     * Enter the state (with crossfade from previous state)
     * @param prevState previous state
     */
    enter(prevState){
        const curAction = this.manager.animations["WalkBackward"];
        if(prevState){
            const prevAction = this.manager.animations[prevState.name];

            curAction.time = 0.0;
            curAction.enabled = true;
            curAction.setEffectiveTimeScale(-1.0);
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
 * Sneak state for the character
 */
export class SneakState extends BaseCharState{
    constructor() {
        super();
        this.movementPossible = true;
    }
    updateState(input){

    }
}

/**
 * Jump attack state for the character
 */
export class JumpAttackState extends BaseCharState{
    constructor() {
        super();
        this.movementPossible = false;
    }
    updateState(deltaTime, input){

    }
}

export class SneakAttackState extends BaseCharState{
    constructor() {
        super();
        this.movementPossible = false;
    }
}

/**
 * Default attack state for the character
 */
export class DefaultAttackState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
        this.timer = 0;
        this.movementPossible = false;
    }

    /**
     * Get the name of the state
     * @returns {string} name of the state
     */
    get name(){
        return "DefaultAttack"
    }

    /**
     * Update the state
     * @param deltaTime time passed since last update
     * @param input input from the user
     */
    updateState(deltaTime, input) {
        if(!this.checkTimer(deltaTime)) return;
        if(input.keys.forward || input.keys.backward || input.keys.left || input.keys.right){
            if(input.keys.forward && input.keys.sprint){
                this.manager.setState("Run");
            } else if(input.keys.forward){
                this.manager.setState("WalkForward");
            } else if(input.keys.backward){
                this.manager.setState("WalkBackward");
            }
        } else if (input.keys.up){
            //this.manager.setState("Jump");
        } else if(!input.mouse.leftClick){
            this.manager.setState("Idle");
        }
    }

    /**
     * Check if the timer has reached the end of the animation
     * @param deltaTime time passed since last update
     * @returns {boolean} true if the timer has reached the end of the animation
     */
    checkTimer(deltaTime) {
        this.timer += deltaTime;
        if (this.timer > this.manager.animations["DefaultAttack"].getClip().duration) {
            this.timer = 0;
            return true;
        }
        return false;
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
            curAction.setEffectiveTimeScale(-1.0);
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
 * Take damage state for the character
 */
export class TakeDamageState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = false;
    }
    get name(){
        return "TakeDamage"
    }
    enter(prevState){
        const curAction = this.manager.animations["ReceiveHit"];
        if(prevState){
            const prevAction = this.manager.animations[prevState.name];

            curAction.time = 0.0;
            curAction.enabled = true;
            curAction.setEffectiveTimeScale(-1.0);
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
 * Frozen state for the character
 */
export class FrozenState extends BaseCharState{
    constructor() {
        super();
    }
}

/**
 * Healing state for the character
 */
export class HealingState extends BaseCharState{
    constructor() {
        super();
    }
}

/**
 * Eating state for the character
 */
export class EatingState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
        this.timer = 0;
        this.movementPossible = false;
    }

    /**
     * Get the name of the state
     * @returns {string} name of the state
     */
    get name(){
        return "Eating"
    }

    /**
     * Update the state
     * @param deltaTime time passed since last update
     * @param input input from the user
     */
    updateState(deltaTime, input) {
        if(!this.checkTimer(deltaTime)) return;
        if(input.keys.forward || input.keys.backward || input.keys.left || input.keys.right){
            if(input.keys.forward && input.keys.sprint){
                this.manager.setState("Run");
            } else if(input.keys.forward){
                this.manager.setState("WalkForward");
            } else if(input.keys.backward){
                this.manager.setState("WalkBackward");
            }
        } else if (input.keys.up){
            //this.manager.setState("Jump");
        }
        else if(input.mouse.leftClick){
            this.manager.setState("DefaultAttack");
        } if(!input.mouse.leftClick){
            this.manager.setState("Idle");
        }
    }

    /**
     * Check if the timer has reached the end of the animation
     * @param deltaTime time passed since last update
     * @returns {boolean} true if the timer has reached the end of the animation
     */
    checkTimer(deltaTime) {
        this.timer += deltaTime;
        if (this.timer > this.manager.animations["Eating"].getClip().duration) {
            this.timer = 0;
            return true;
        }
        return false;
    }

    /**
     * Enter the state (with crossfade from previous state)
     * @param prevState previous state
     */
    enter(prevState){
        const curAction = this.manager.animations["Eating"];
        if(prevState){
            const prevAction = this.manager.animations[prevState.name];

            curAction.time = 0.0;
            curAction.enabled = true;
            curAction.setEffectiveTimeScale(-1.0);
            curAction.setEffectiveWeight(1.0);

            //possible necessary logic

            curAction.crossFadeFrom(prevAction,0.5,true);
            curAction.play();
        } else {
            curAction.play();
        }
    }

}