import {assetPaths, hasAnimations} from "../configs/ViewConfigs.js";
import {Controller} from "./Controller.js";
import * as THREE from "three";
import {clone} from "three-SkeletonUtils";

/**
 * Class to manage assets
 */
export class AssetManager{
    #modelList;
    #assetLoader;
    constructor() {
        this.#assetLoader = new Controller.AssetLoader();
        this.#modelList = {};
    }

    /**
     * Load the 3d models and their animations
     * @returns {Promise<void>} a promise that resolves when all the models are loaded
     */
    async loadViews(){
        let promises = [];
        for(const key in assetPaths) {
            promises.push(this.#assetLoader.loadAsset(assetPaths[key]));
        }
        await Promise.all(promises).then((values) => {
            let index = 0;
            for(const key in assetPaths) {
                const {charModel, animations} = values[index];
                this.#modelList[key] = {model: charModel, animations: animations };
                index++;
            }
        });
    }
    /**
     * Get a clone of a 3d model
     * @param name name of the model
     * @returns {*} the 3d model
     */
    getModel(name){
        console.log(this.#modelList)
        if(this.#modelList[name]){
            return clone(this.#modelList[name].model);
        } else {
            throw new Error(`no model exists for ${name}.`);
        }
    }

    /**
     * Get the animations of a 3d model
     * @param name name of the model
     * @returns {*} the animations
     */
    getAnimations(name){
        if(this.#modelList?.[name].animations){
            return this.#modelList[name].animations;
        } else {
            throw new Error(`no animations exists for ${name}.`);
        }
    }
}