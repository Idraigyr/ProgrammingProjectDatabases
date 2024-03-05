import {State} from "../../Patterns/State.js";

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
export class IdleState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
        this.movementPossible = true;
    }
    get name(){
        return "Idle"
    }
    updateState(deltaTime, input){
        if(input.keys.forward || input.keys.backward || input.keys.left || input.keys.right){
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

export class RunForwardState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
    }
    get name(){
        return "Run"
    }
    updateState(deltaTime, input){
        if(input.keys.forward || input.keys.backward || input.keys.left || input.keys.right){
            if((input.keys.forward || input.keys.left || input.keys.right) && !input.keys.sprint){
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
        } else {
            this.manager.setState("Idle");
        }
    }

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
export class WalkForwardState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
    }
    get name(){
        return "WalkForward"
    }
    updateState(deltaTime, input){
        if(input.keys.forward || input.keys.backward || input.keys.left || input.keys.right){
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

export class WalkBackWardState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
    }
    get name(){
        return "WalkBackward"
    }
    updateState(deltaTime, input){
        if(input.keys.forward || input.keys.backward || input.keys.left || input.keys.right){
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
        }
    }
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

export class SneakState extends BaseCharState{
    constructor() {
        super();
    }
    updateState(input){

    }
}

export class JumpAttackState extends BaseCharState{
    constructor() {
        super();
    }
    updateState(deltaTime, input){

    }
}

export class SneakAttackState extends BaseCharState{
    constructor() {
        super();
    }
}

export class DefaultAttackState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
        this.timer = 0;
    }
    get name(){
        return "DefaultAttack"
    }
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
        } if(!input.mouse.leftClick){
            this.manager.setState("Idle");
        }
    }
    checkTimer(deltaTime) {
        this.timer += deltaTime;
        if (this.timer > this.manager.animations["DefaultAttack"].getClip().duration) {
            this.timer = 0;
            return true;
        }
        return false;
    }

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

export class TakeDamageState extends BaseCharState{
    constructor(fsm) {
        super(fsm);
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

export class FrozenState extends BaseCharState{
    constructor() {
        super();
    }
}

export class HealingState extends BaseCharState{
    constructor() {
        super();
    }
}