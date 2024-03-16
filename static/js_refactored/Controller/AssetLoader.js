import {GLTFLoader} from "three-GLTFLoader";
import {FBXLoader} from "three-FBXLoader";
import * as THREE from "three";
import {getFileExtension} from "../helpers.js";
import {AnimationMixer} from "three";

export class AssetLoader{
    constructor() {
        //code to update loading screen progress bar via loadingmanager
        this.loadingManager = new THREE.LoadingManager();
        // Use arrow functions or bind `this` to retain the correct context
        const progressBar = document.getElementById('progress-bar');
        this.loadingManager.onProgress = (url, loaded, total) => {
            progressBar.value = (loaded / total) * 100;
        };

        const progressBarContainer = document.querySelector('.progress-bar-container');
        this.loadingManager.onLoad = () => {
            progressBarContainer.style.display = 'none';
        };
    }

    loadAsset(path) {
        let extension = getFileExtension(path);
        if (extension === "glb" || extension === "gltf") {
            return this.loadGLTF(path);
        } else if (extension === "fbx") {
            return this.loadFBX(path);
        } else {
            throw new Error(`cannot load model with .${extension} extension`);
        }
    }


    //TODO:: add timeout error handler
    loadGLTF(path){
        let loader = new GLTFLoader(this.loadingManager);
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
    loadFBX(path){
        let loader = new FBXLoader(this.loadingManager);
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