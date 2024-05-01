import {Subject} from "../Patterns/Subject.js";
import {View} from "../View/ViewNamespace.js";
import {IAnimatedView} from "../View/View.js";
import {RitualSpell} from "../View/SpellView.js";
import {convertWorldToGridPosition} from "../helpers.js";
import {buildTypes} from "../configs/Enums.js";
import {Model} from "../Model/ModelNamespace.js";

/**
 * Class to manage the views of the game
 */
export class ViewManager extends Subject{
    constructor(params) {
        super(params);
        this.pairs = {
            building: [],
            island: [],
            player: [],
            character: [],
            spellEntity: [],
            proxy: []
        };
        this.dyingViews = [];
        this.spellPreview = params.spellPreview;
    }

    /**
     * Renders the spell preview
     * @param event {{detail: {type: {name: string}, params: {position: THREE.Vector3, rotation: THREE.Euler}}}} event
     */
    renderSpellPreview(event){
        if(!event.detail.params.position){
            this.spellPreview.charModel.visible = false;
            return;
        }
        const newEvent = {detail: {name: "", position: event.detail.params.position.clone()}};
        const island = this.getIslandByPosition(newEvent.detail.position);
        if(event.detail.type.name === "build"){
            if(island?.checkCell(newEvent.detail.position) !== buildTypes.getNumber("empty")){
                newEvent.detail.name = "augmentBuild";
            } else {
                newEvent.detail.name = "build";
            }
            convertWorldToGridPosition(newEvent.detail.position);
            newEvent.detail.position.y = 0;
        } else {
            newEvent.detail.name = event.detail.type.name;
            newEvent.detail.rotation = event.detail.params?.rotation;
        }
        this.spellPreview.render(newEvent);
    }

    /**
     * Returns the island model at the given position
     * @param position position to check
     * @returns {Model|*|null} island model
     */
    getIslandByPosition(position){
        for(const island of this.pairs.island){
            const min = island.view.boundingBox.min;
            const max = island.view.boundingBox.max;
            if(position.x > min.x && position.x < max.x && position.z > min.z && position.z < max.z){
                return island.model;
            }
        }
        return null;
    }

    /**
     * Add pairs to the pairs list of the manager
     * @param model model to add
     * @param view view to add
     */
    addPair(model, view){
        if(model.type === "player" && this.pairs.player.length > 0){
            this.pairs.character.push({model, view});
            return;
            // throw new Error("player already exists");
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

    /**
     * retrieve the player model by id
     * @param {number} id
     * @return {Wizard|*}
     */
    getPlayerModelByID(id){ //TODO: probably not a good idea to retrieve models from the viewManager; is player model id unique across all characters?
        console.log("retrieving player model by id: ", id)
        if(this.pairs.player[0].model.id === id){
            return this.pairs.player[0].model;
        } else {
            const char = this.pairs.character.find((pair) => {
                console.log(pair.model.id);
                return pair.model instanceof Model.Character && pair.model.id === id;
            });
            console.log(char);
            if(char){
                return char.model;
            }
        }
        return null;
    }

    /**
     * Change the view asset of the given model
     * @param event {{detail: {model: Model, viewAsset: THREE.Object3D}}}
     */
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
                pair.view.dispose();
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
     * Get the collider models of the manager
     * @param array array to fill with collider models
     */
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
        this.dyingViews = this.dyingViews.filter((view) => view.isNotDead(deltaTime));
    }

    updateProxys(deltaTime){
        this.pairs.proxy.forEach((pair) => {
            pair.view.update(deltaTime);
        });
    }
}