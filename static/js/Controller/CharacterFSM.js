import {
    DefaultAttackState, EatingState,
    IdleState,
    RunForwardState, TakeDamageState,
    WalkBackWardState,
    WalkForwardState,

} from "../Model/States/PlayerStates.js";

import {FiniteStateMachine} from "../Patterns/FiniteStateMachine.js";
import {
    MinionDefaultAttackState,
    MinionIdleState,
    MinionWalkBackwardState,
    MinionWalkForwardState
} from "../Model/States/MinionStates.js";

/**
 * Class to manage the player's states
 */
export class PlayerFSM extends FiniteStateMachine{
    constructor(animations) {
        super();
        this.init();
        this.animations = animations;
        this.setState("Idle");
    }

    /**
     * Initialize the states of the player
     */
    init(){
        this.addState("Idle",IdleState);
        this.addState("WalkForward",WalkForwardState);
        this.addState("WalkBackward",WalkBackWardState);
        this.addState("DefaultAttack",DefaultAttackState);
        this.addState("Run",RunForwardState);
        this.addState("TakeDamage",TakeDamageState);
        this.addState("Eating",EatingState)
    }
}

export class MinionFSM extends FiniteStateMachine{
    constructor(animations) {
        super();
        this.init();
        this.animations = animations;
        this.setState("Idle");
    }

    /**
     * Initialize the states of the minion
     */
    init(){
        this.addState("Idle",MinionIdleState);
        this.addState("WalkForward",MinionWalkForwardState);
        this.addState("WalkBackward",MinionWalkBackwardState);
        this.addState("DefaultAttack",MinionDefaultAttackState);
    }
}