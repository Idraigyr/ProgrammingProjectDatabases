import {assetPaths} from "../configs/ViewConfigs.js";
import {Controller} from "./Controller.js";
import * as THREE from "three";
import {clone} from "three-SkeletonUtils";
import {correctRitualScale} from "../helpers.js";

/**
 * Class to manage assets
 */
export class AssetManager{
    #assetList;
    #assetLoader;
    constructor() {
        this.#assetLoader = new Controller.AssetLoader();
        this.#assetList = {};
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
                const {charModel = null, animations = null, texture = null} = values[index];
                this.#assetList[key] = {};

                if(charModel){
                    //TODO: move out of manager and into loader
                    if(key === "Mine"){
                        correctRitualScale(charModel);
                        const box = new THREE.Box3().setFromObject(charModel);
                        box.setFromObject(charModel,true);
                        const c = box.getCenter( new THREE.Vector3( ) );
                        c.y = 0;
                        charModel.position.add(new THREE.Vector3().sub(c));
                        let group = new THREE.Group();
                        group.add(charModel);
                        this.#assetList[key].model = group;
                    } else {
                        this.#assetList[key].model = charModel;
                    }
                }
                if(animations){
                    this.#assetList[key].animations = animations;
                }
                if(texture){
                    this.#assetList[key].texture = texture;
                }
                index++;
            }
        });
    }
    /**
     * Get a clone of a 3d model
     * @param name name of the model
     * @returns {*} the 3d model
     */
    getAsset(name){
        if(this.#assetList[name]) {
            if (this.#assetList[name].model) {
                return clone(this.#assetList[name].model);
            } else if (this.#assetList[name].texture) {
                return this.#assetList[name].texture.clone();
            }
            throw new Error(`no asset exists for ${name}.`);
        }
    }
    /**
     * Get the animations of a 3d model
     * @param name name of the model
     * @returns {*} the animations
     */
    getAnimations(name){
        if(this.#assetList?.[name].animations){
            return this.#assetList[name].animations;
        } else {
            throw new Error(`no animations exists for ${name}.`);
        }
    }
}