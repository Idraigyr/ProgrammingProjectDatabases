
export class Timer{
    constructor(timerName, duration, onEndEvent, repeatable= false){
        this.duration = duration;
        this.timer = 0;
        this.name = timerName;
        this.onEndEvent = onEndEvent;
        this.repeatable = repeatable;
        this.finished = false;
    }

    update(deltaTime){
        if(this.finished) return;
        this.timer += deltaTime;
        if(this.timer >= this.duration){
            document.dispatchEvent(this.onEndEvent);
            if(this.repeatable){
                this.timer = 0;
            }else{
                this.finished = true;
            }
        }
    }
}
export class TimerManager {
    #timers;

    constructor() {
        this.#timers = [];
    }

    createTimer(timerName, duration, onEndEvent, repeatable= false){
        this.#timers.push(new Timer(timerName, duration, onEndEvent, repeatable));
    }

    getTimer(timerName){
        return this.#timers.find((timer) => timer.name === timerName);
    }

    decreaseTimer(timerName, deltaTime){
        const timer = this.getTimer(timerName);
        if(timer){
            timer.update(deltaTime);
        }

    }

    removeTimer(timerName){
        this.#timers = this.#timers.filter((timer) => timer.name !== timerName);
    }

    addTimer(timer){
        this.#timers.push(timer);
    }

    update(deltaTime) {
        this.#timers.forEach((timer) => {
            timer.update(deltaTime);
        });
        // Remove finished timers
        this.#timers = this.#timers.filter((timer) => !timer.finished);
    }
}