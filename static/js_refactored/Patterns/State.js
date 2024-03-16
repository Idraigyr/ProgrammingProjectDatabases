/**
 * Base class for all states
 */
export class State{
    constructor(fsm) {
        this.manager = fsm;
    }
    get name(){

    }
    enter(){}
    exit(){}
    update(deltaTime, input){}
}