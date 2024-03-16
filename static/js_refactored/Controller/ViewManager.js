import {IAnimatedView} from "../View/View.js";
import {Fireball} from "../View/SpellView.js"

export class ViewManager{
    constructor() {
        this.pairs = {
            building: [],
            island: [],
            player: [],
            entity: [],
            spellEntity: []
        };
    }
    addPair(model, view){
        if(model.type === "player" && Object.keys(this.pairs.player).length === 0){
            this.pairs.player.push({model, view});
        } else if(model.type === "player"){
            throw new Error("player already exists");
        } else {
            this.pairs[model.type].push({model, view});
        }
    }
    /**
    * callback to delete view when model is deleted. Should be called with every deletion of a model object
    * @param {{detail: model}} event
    */
    deleteView(event){
        this.pairs[event.detail.model.type].filter((pair) => pair.model !== event.detail.model);
    }

    get ritualTouchables(){
        let touchables = [];
        this.pairs.building.forEach((pair) => touchables.push(pair.view));
        this.pairs.island.forEach((pair) => touchables.push(pair.view));
        return touchables;
    }

    updateAnimatedViews(deltaTime){
        for(const type in this.pairs){
            this.pairs[type].forEach((pair) => {
                if(pair.view instanceof IAnimatedView) {
                    pair.view.update(deltaTime);
                } else if(pair.view instanceof Fireball){
                    pair.view.particleSystem.update(deltaTime);
                }
            });
        }
    }
}