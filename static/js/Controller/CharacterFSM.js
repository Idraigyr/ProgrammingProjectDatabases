import {
    DefaultAttackState,
    IdleState,
    RunForwardState, TakeDamageState,
    WalkBackWardState,
    WalkForwardState
} from "../Model/States/CharacterStates.js";

import {FiniteStateMachine} from "../Patterns/FiniteStateMachine.js";

/**
 * Class to manage the player's states
 */
export class PlayerFSM extends FiniteStateMachine{
    constructor(animations) {
        super();
        this.init();
        this.animations = animations;
        this.currentState = new IdleState(this);
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
    }
}