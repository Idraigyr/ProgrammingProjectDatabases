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

    /**
     * Add pairs to the pairs list of the manager
     * @param model model to add
     * @param view view to add
     */
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
        // TODO: proper version of this
        for(const model in this.pairs.building){
            touchables.push(this.pairs.building[model]);
        }
        for(const model in this.pairs.island){
            touchables.push(this.pairs.island[model]);
        }
        return touchables;
    }
    get planes(){
        let planes = [];
        for(const islandKey in this.pairs.island){
            let island = this.pairs.island[islandKey];
            planes.push(island.blockPlane);
        }
        return planes;
    }

    /**
     * Updates all views with the given delta time
     * @param deltaTime time difference
     */
    updateAnimatedViews(deltaTime){
        for(const type in this.pairs){
            for(const model in this.pairs[type]){
                if(!(this.pairs[type][model] instanceof IAnimatedView)) continue;
                this.pairs[type][model].update(deltaTime)
            }
        }
    }
}