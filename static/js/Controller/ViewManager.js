import {Subject} from "../Patterns/Subject.js";
import {View} from "../View/ViewNamespace.js";
import {IAnimatedView} from "../View/View.js";
import {Fireball} from "../View/SpellView.js";
import {RitualSpell} from "../View/SpellView.js";

export class ViewManager extends Subject{
    constructor(params) {
        super(params);
        this.pairs = {
            building: [],
            island: [],
            player: [],
            character: [],
            spellEntity: []
        };
        this.dyingViews = [];
        this.spellPreview = params.spellPreview;
        document.addEventListener("changeViewAsset", this.changeViewAsset.bind(this));
    }

    /**
     * Add pairs to the pairs list of the manager
     * @param model model to add
     * @param view view to add
     */
    addPair(model, view){
        if(model.type === "player" && this.pairs.player.length > 0){
            throw new Error("player already exists");
        }
        this.pairs[model.type].push({model, view});
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
    changeViewAsset(event){
        // Model, ViewAsset
        let model = event.detail.model;
        let viewAsset = event.detail.viewAsset;
        // Get the pair
        let pair = this.getPair(model);
        // Get the old view
        let oldView = pair.view;
        // Copy old parameters (such as position, rotation, scale) to the asset
        // TODO: is it correct to assume that you have to copy the position, rotation and scale of the old view to the new view?
        viewAsset.position.copy(oldView.charModel.position);
        viewAsset.rotation.copy(oldView.charModel.rotation);
        viewAsset.scale.copy(oldView.charModel.scale);
        // Get the scene
        let scene = oldView.charModel.parent;
        // Remove the old view from the scene
        scene.remove(oldView.charModel);
        // Add the new view to the scene
        scene.add(viewAsset);
        // Change the asset of the view
        oldView.charModel = viewAsset;
    }

    /**
    * callback to delete view when model is deleted. Should be called with every deletion of a model object
    * @param {{detail: model}} event
    */
    deleteView(event){
        this.pairs[event.detail.model.type] = this.pairs[event.detail.model.type].filter((pair) => {
            if(pair.model === event.detail.model){
                if(pair.view.staysAlive){
                    this.dyingViews.push(pair.view);
                }
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

    getColliderModels(array){
        array.splice(0, array.length);
        this.pairs.building.forEach((pair) => array.push(pair.view.charModel));
        this.pairs.island.forEach((pair) => array.push(pair.view.charModel));
    }

    /**
     * Updates all views with the given delta time
     * @param deltaTime time difference
     */
    updateAnimatedViews(deltaTime){
        this.spellPreview.update(deltaTime);
        for(const type in this.pairs){
            this.pairs[type].forEach((pair) => {
                if(pair.view instanceof IAnimatedView) {
                    pair.view.update(deltaTime);
                } else if(pair.view instanceof View.Fireball){ //TODO: make new superclass for 1 else if instanceof SpellView
                    pair.view.update(deltaTime);
                } else if(pair.view instanceof View.ThunderCloud){
                    pair.view.update(deltaTime);
                } else if(pair.view instanceof View.Shield){
                    pair.view.update(deltaTime);
                } else if(pair.view instanceof RitualSpell){
                    pair.view.update(deltaTime);
                }
            });
        }
        this.dyingViews = this.dyingViews.filter((spell) => spell.isNotDead(deltaTime));
    }
}