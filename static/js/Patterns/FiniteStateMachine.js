import {Subject} from "./Subject.js";

/**
 * @class FiniteStateMachine - A class that represents a finite state machine
 */
export class FiniteStateMachine extends Subject{
    #states = {};
    constructor(params) {
        super(params);
        this.currentState = null;
    }

    /**
     * @method updateState - updates the current state
     * @param deltaTime - time between frames
     * @param input - input from the user
     */
    updateState(deltaTime, input){
        if(!this.currentState) return;
        this.currentState.updateState(deltaTime, input);
    }

    /**
     * same as updateState but event based
     * @param event
     */
    processEvent(event){
        if(!this.currentState) return;
        this.currentState.processEvent(event);
    }

    /**
     * @method setState - sets the current state
     * @param name - name of the state
     */
    setState(name){
        const prevState = this.currentState
        if(prevState){
            if(prevState.name === name) return;
            prevState.exit();
        }

        this.currentState = new this.#states[name](this);
        this.currentState.enter(prevState);
        this.dispatchEvent(this.createUpdatedStateEvent());
    }

    createUpdatedStateEvent(){
        return new CustomEvent("updatedState", {detail: {state: this.currentState.name}});
    }

    /**
     * @method addState - adds a state to the state machine
     * @param name - name of the state
     * @param type - type of the state
     */
    addState(name, type){
        this.#states[name] = type;
    }
    init(){

    }
}