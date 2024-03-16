import {GLTFLoader} from "three-GLTFLoader";
import {FBXLoader} from "three-FBXLoader";
import * as THREE from "three";
import {getFileExtension} from "../helpers.js";
import {AnimationMixer} from "three";

/**
 * Class to load assets
 */
export class AssetLoader{
    constructor() {
        this.loadingManager = new THREE.LoadingManager();
    }

    /**
     * Load asset
     * @param path path to the asset
     * @returns {*} the model and its animations
     */
    loadAsset(path){
        let extension = getFileExtension(path);
        if(extension === "glb" || extension === "gltf"){
            return this.loadGLTF(path);
        } else if(extension === "fbx"){
            return this.loadFBX(path);
        } else {
            throw new Error(`cannot load model with .${extension} extension`);
        }
    }

    //TODO:: add timeout error handler
    /**
     * Load a gltf model
     * @param path path to the model
     * @returns {*} the model and its animations
     */
    loadGLTF(path){
        let loader = new GLTFLoader();
        return loader.loadAsync(path, function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }).then((gltf) => {
            let charModel;
            let animations = null;

            charModel = gltf.scene;
            charModel.traverse(c => {
                c.castShadow = true;
            });
            if(gltf.animations.length > 0){
                animations = gltf.animations;
            }
            return {charModel, animations};
        },(err) => {
            throw new Error(err);
        });
    }

    /**
     * Load a fbx model
     * @param path path to the model
     * @returns {*} the model and its animations
     */
    loadFBX(path){
        let loader = new FBXLoader();
        return loader.loadAsync(path, function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }).then((fbx) => {
            let charModel;
            let animations = null;

            charModel = fbx;
            charModel.traverse(c => {
                c.castShadow = true;
            });
            if(fbx.animations.length > 0){
                animations = fbx.animations;
            }
            return {charModel, animations};
        }, (err) => {
            throw new Error(err);
        });
    }
}