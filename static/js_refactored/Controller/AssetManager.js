import {assetPaths, hasAnimations} from "../configs/ViewConfigs.js";
import {Controller} from "./Controller.js";
import * as THREE from "three";
import {clone} from "three-SkeletonUtils";

export class AssetManager{
    #modelList;
    #assetLoader;
    constructor() {
        this.#assetLoader = new Controller.AssetLoader();
        this.#modelList = {};
    }
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
        console.log(this.#modelList);
    }
    getModel(name){
        if(this.#modelList[name]){
            return clone(this.#modelList[name].model);
        } else {
            throw new Error(`no model exists for ${name}.`);
        }
    }

    getAnimations(name){
        if(this.#modelList?.[name].animations){
            return this.#modelList[name].animations;
        } else {
            throw new Error(`no animations exists for ${name}.`);
        }
    }
}