import {IAnimatedView} from "../View/View.js";

export class ViewManager{
    constructor() {
        this.pairs = {
            building: {},
            island: {},
            player: {},
            entity: {},
            spellEntity: {}
        };
    }
    addPair(model, view){
        if(model.type === "player" && Object.keys(this.pairs.player).length === 0){
            this.pairs.player[model] = view;
        } else if(model.type === "player"){
            throw new Error("player already exists");
        } else {
            this.pairs[model.type][model] = view;
        }
    }
    /**
    * callback to delete view when model is deleted. Should be called with every deletion of a model object
    * @param {{detail: model}} event
    */
    deleteView(event){
        delete this.pairs[event.detail.model.type][event.detail.model];
    }

    get ritualTouchables(){
        let touchables = [];
        for(const model in this.pairs.building){
            touchables.push(this.pairs.building[model]);
        }
        for(const model in this.pairs.island){
            touchables.push(this.pairs.island[model]);
        }
        return touchables;
    }

    updateAnimatedViews(deltaTime){
        for(const type in this.pairs){
            for(const model in this.pairs[type]){
                if(!(this.pairs[type][model] instanceof IAnimatedView)) continue;
                this.pairs[type][model].update(deltaTime)
            }
        }
    }
}