import {GLTFLoader} from "three-GLTFLoader";
import {FBXLoader} from "three-FBXLoader";
import {TextureLoader} from "three-TextureLoader";
import {FontLoader} from "three-FontLoader";
import {DRACOLoader} from "three-DRACOLoader";
import * as THREE from "three";
import {getFileExtension, setIndexAttribute} from "../helpers.js";
import {AnimationMixer} from "three";
import {shadowCasting} from "../configs/ViewConfigs.js";

/**
 * Class to load assets
 */
export class AssetLoader{
    constructor() {
        //code to update loading screen progress bar via loadingmanager
        this.loadingManager = new THREE.LoadingManager();
        // Use arrow functions or bind `this` to retain the correct context
        const progressBar = document.getElementById('progress-bar');
        this.loadingManager.onProgress = (url, loaded, total) => {
            progressBar.value = (loaded / total) * 60 + 10;
        };
        this.logLoading = false;
    }

    /**
     * Load asset
     * @param {string} path path to the asset
     * @returns {*} the model and its animations
     */
    loadAsset(path){
        //let extension = getFileExtension(path);
        let extension = path[1].slice(1);
        if(extension === "glb" || extension === "gltf"){
            return this.loadGLTF(path[0]);
        } else if(extension === "fbx"){
            return this.loadFBX(path[0]);
        } else if(extension === "png" || extension === "jpg") {
            return this.loadTexture(path[0]);
        }   // TODO: json can be used for fonts, but also for other things...
          else if (extension === "json"){
            return this.loadFont(path[0]);
        } else {
            throw new Error(`cannot load model with .${extension} extension`);
        }
    }

    //TODO:: add timeout error handler
    /**
     * Load a gltf model
     * @param {string} path path to the model
     * @returns {*} the model and its animations
     */
    loadGLTF(path){
        let loader = new GLTFLoader();
        let draco = new DRACOLoader();
        draco.setDecoderPath( './static/decoders/dracoloader/' );
        loader.setDRACOLoader( draco );
        return loader.loadAsync(path, function (xhr) {
            if(this.logLoading) console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }).then((gltf) => {
            let charModel;
            let animations = null;

            charModel = gltf.scene;
            charModel.traverse(c => {
                c.castShadow = true;
                if(shadowCasting) c.receiveShadow = true;
            });
            if(gltf.animations.length > 0){
                animations = gltf.animations;
                return {charModel, animations};
            }
            return {charModel};
        },(err) => {
            throw new Error(err);
        });
    }

    /**
     * Load a fbx model
     * @param {string} path path to the model
     * @returns {*} the model and its animations
     */
    loadFBX(path){
        let loader = new FBXLoader(this.loadingManager);
        return loader.loadAsync(path, function (xhr) {
            if(this.logLoading) console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }).then((fbx) => {
            let charModel;
            let animations = null;

            charModel = fbx;
            charModel.traverse(c => {
                if(c.isMesh && c.geometry.index === null){
                    setIndexAttribute(c.geometry);
                }
                c.castShadow = true;
                if(shadowCasting) c.receiveShadow = true;
            });
            if(fbx.animations.length > 0){
                animations = fbx.animations;
                return {charModel, animations};
            }
            return {charModel};
        }, (err) => {
            throw new Error(err);
        });
    }

    /**
     * Load a texture
     * @param {string} path
     * @return {*}
     */
    loadTexture(path){
        let loader = new TextureLoader();
        return loader.loadAsync(path, function (xhr) {
            if(this.logLoading) console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }).then((texture) => {
            return {texture};
        }, (err) => {
            throw new Error(err);
        });
    }

    /**
     * Load a font
     * @param {string} path
     * @return {*}
     */
    loadFont(path){
        let loader = new FontLoader();
        return loader.loadAsync(path, function (xhr) {
            if(this.logLoading) console.log((xhr.loaded / xhr.total * 100) + '% of a font loaded');
        }).then((font) => {
            return {font};
        }, (err) => {
            throw new Error(err);
        });
    }
}