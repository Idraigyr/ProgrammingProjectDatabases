import {GLTFLoader} from "three-GLTFLoader";
import {FBXLoader} from "three-FBXLoader";
import {TextureLoader} from "three-TextureLoader";
import * as THREE from "three";
import {getFileExtension} from "../helpers.js";
import {AnimationMixer} from "three";

export class AssetLoader{
    constructor() {
        this.loadingManager = new THREE.LoadingManager();
    }
    loadAsset(path){
        let extension = getFileExtension(path);
        if(extension === "glb" || extension === "gltf"){
            return this.loadGLTF(path);
        } else if(extension === "fbx"){
            return this.loadFBX(path);
        } else if(extension === "png" || extension === "jpg"){
            return this.loadTexture(path);
        } else {
            throw new Error(`cannot load model with .${extension} extension`);
        }
    }

    //TODO:: add timeout error handler
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
                return {charModel, animations};
            }
            return {charModel};
        },(err) => {
            throw new Error(err);
        });
    }
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
                return {charModel, animations};
            }
            return {charModel};
        }, (err) => {
            throw new Error(err);
        });
    }

    loadTexture(path){
        let loader = new TextureLoader();
        return loader.loadAsync(path, function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        }).then((texture) => {
            return {texture};
        }, (err) => {
            throw new Error(err);
        });
    }
}