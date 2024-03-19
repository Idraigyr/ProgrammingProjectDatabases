import {IAnimatedView} from "../View/View.js";
import {Fireball, ThunderCloud} from "../View/SpellView.js";
import {Shield} from "../View/Shield.js";

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

    /**
     * Add pairs to the pairs list of the manager
     * @param model model to add
     * @param view view to add
     */
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
     * Returns the corresponding view of the given model
     * @param model model to get the view
     * @returns {*} view
     */
    getPair(model){
        if(model.type === "player"){
            return this.pairs.player[0];
        } else {
            let found = null
            this.pairs[model.type].forEach((pair) => {
                if(pair.model === model){
                    found = pair;
                }
            });
            return found;
        }
    }
    /**
    * callback to delete view when model is deleted. Should be called with every deletion of a model object
    * @param {{detail: model}} event
    */
    deleteView(event){
        this.pairs[event.detail.model.type] = this.pairs[event.detail.model.type].filter((pair) => {
            if(pair.model === event.detail.model){
                pair.view.cleanUp();
                return false;
            }
            return true;
        });
    }

    /**
     * Returns all touchable objects
     * @returns {*[]} list of touchable objects
     */
    get ritualTouchables(){
        let touchables = [];
        this.pairs.building.forEach((pair) => touchables.push(pair.view));
        this.pairs.island.forEach((pair) => touchables.push(pair.view));
        return touchables;
    }

    /**
     * Returns all building planes
     * @returns {*[]} list of building planes
     */
    get planes(){
        let planes = [];
        for(const islandKey in this.pairs.island){
            let islandView = this.pairs.island[islandKey].view;
            planes.push(islandView.blockPlane);
        }
        return planes;
    }

    /**
     * Updates all views with the given delta time
     * @param deltaTime time difference
     */
    updateAnimatedViews(deltaTime){
        for(const type in this.pairs){
            this.pairs[type].forEach((pair) => {
                if(pair.view instanceof IAnimatedView) {
                    pair.view.update(deltaTime);
                } else if(pair.view instanceof Fireball){ //TODO: make new superclass for 1 else if instanceof SpellView
                    pair.view.update(deltaTime);
                } else if(pair.view instanceof ThunderCloud){
                    pair.view.update(deltaTime);
                } else if(pair.view instanceof Shield){
                    pair.view.update(deltaTime);
                }
            });
        }
    }
}