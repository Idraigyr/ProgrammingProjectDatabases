/**
 * Base class for all states
 */
export class State{
    constructor(fsm) {
        this.manager = fsm;
    }

    /**
     * @returns {string} The name of the state
     */
    get name(){

    }

    /**
     * Called when the state is entered
     */
    enter(){}

    /**
     * Called when the state is exited
     */
    exit(){}

    /**
     * Called every frame
     * @param deltaTime The time since the last frame
     * @param input The input
     */
    updateState(deltaTime, input){}

    /**
     * same as updateState but event based
     * @param event
     */
    processEvent(event){}
}