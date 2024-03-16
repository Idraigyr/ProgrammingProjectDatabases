import {assetPaths} from "../configs/ViewConfigs.js";
import {Controller} from "./Controller.js";
import * as THREE from "three";
import {clone} from "three-SkeletonUtils";

export class AssetManager{
    #assetList;
    #assetLoader;
    constructor() {
        this.#assetLoader = new Controller.AssetLoader();
        this.#assetList = {};
    }
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
                    this.#assetList[key].model = charModel;
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
    getAsset(name){
        if(this.#assetList[name]){
            if(this.#assetList[name].model){
                return clone(this.#assetList[name].model);
            } else if(this.#assetList[name].texture){
                return this.#assetList[name].texture.clone();
            }
        }
        throw new Error(`no asset exists for ${name}.`);
    }

    getAnimations(name){
        if(this.#assetList?.[name].animations){
            return this.#assetList[name].animations;
        } else {
            throw new Error(`no animations exists for ${name}.`);
        }
    }
}