import {GLTFLoader} from "three-GLTFLoader";
import {ViewConfigs} from "../configs/ViewConfigs.js";

export class AssetManager{
    #gltfAssetLoader;
    #modelList;
    scene;
    constructor() {
        this.#gltfAssetLoader = new GLTFLoader();
        this.#modelList = {};
    }
    async loadViews(){
        for(const key in ViewConfigs) {
            const path = ViewConfigs[key];
            this.#gltfAssetLoader.load(path, (gltf) => {
            let charModel = gltf.scene;
            charModel.traverse(c => {
                c.castShadow = true;
            });
            this.#modelList[key] = charModel;
            },undefined, (err) => {
                console.log(err);
            });
    }
    }
    getModel(name){
        return this.#modelList[name];
    }
}