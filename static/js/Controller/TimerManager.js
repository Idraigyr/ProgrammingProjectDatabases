
export class Timer{
    /**
     *
     * @param parent - parent of the timer, update function will be called by the parent
     * @param duration - duration of the timer
     * @param callbacks - array of callbacks to be called when the timer ends
     * @param callbackParams - array of parameters for the callbacks either null or the same length as callbacks
     * @param repeatable - if true, the timer will repeat
     */
    constructor(duration, callbacks, repeatable= false, callbackParams = null){
        this.parent = null;
        this.id = null;
        this.duration = duration;
        this.timer = 0;
        this.callbacks = callbacks;
        this.callbacksParams = callbackParams;
        this.repeatable = repeatable;
        this.finished = false;
    }

    /**
     * links a timer to a TimerManager and gives it an id for that parent
     * @param id
     * @param parent
     */
    setID(id, parent){
        if(this.parent){
            this.parent.removeTimer(this.id);
        }
        this.parent = parent;
        this.id = id;
    }

    /**
     * updates the timer and calls the callbacks if the timer has ended
     * @param deltaTime
     */
    update(deltaTime){
        if(this.finished) return;
        this.timer += deltaTime;
        if(this.timer >= this.duration){
            this.callbacks.forEach((callback, i) => callback(this.callbacksParams?.[i]));
            if(this.repeatable){
                this.timer = 0;
            }else{
                this.finished = true;
                // remove timer from parent - remove this line if you want to keep the timer in the parent (maybe 2 timerClasses: one that deletes itself and one that doesn't)
                //only update the timer from parent!
                this.parent.removeTimer(this.id);
            }
        }
    }
}
export class TimerManager {
    #timers;

    constructor() {
        this.#timers = [];
    }

    createTimer(duration, callbacks, repeatable= false, callbackParams = null){
        const timer = new Timer(duration, callbacks, repeatable, callbackParams);
        timer.setID(this.insertTimer(timer), this);
        return timer;
    }

    addTimer(timer){
        timer.setID(this.insertTimer(timer), this);
    }

    /**
     * adds timer to the manager
     * @param timer
     * @return {number} - id of the timer
     */
    insertTimer(timer){
        for (let i = 0; i < this.#timers.length; i++){
            if(this.#timers[i] === null){
                this.#timers[i] = timer;
                return i;
            }
        }
        this.#timers.push(timer);
        return this.#timers.length - 1;
    }

    /**
     * removes timer from the manager
     * @param timerId
     */
    removeTimer(timerId){
        this.#timers[timerId] = null;
        while(this.#timers[this.#timers.length - 1] === null){
            this.#timers.pop();
        }
    }

    /**
     * gets the timer by id
     * @param timerId
     * @return {Timer}
     */
    getTimer(timerId){
        return this.#timers?.[timerId];
    }


    decreaseTimer(timerId, deltaTime){
        const timer = this.getTimer(timerId);
        if(timer){
            timer.update(deltaTime);
        }

    }

    update(deltaTime) {
        this.#timers.forEach((timer) => {
            timer.update(deltaTime);
        });
        // is now done by the timer itself!!!
        // // Remove finished timers
        // this.#timers = this.#timers.filter((timer) => !timer.finished);
    }
}