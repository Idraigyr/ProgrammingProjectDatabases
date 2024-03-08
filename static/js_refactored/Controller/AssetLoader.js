import {GLTFLoader} from "three-GLTFLoader";
import {FBXLoader} from "three-FBXLoader";
import * as THREE from "three";

export class AssetLoader{
    constructor(scene) {
        this.scene = scene;
        this.loadingManager = new THREE.LoadingManager();
    }
    loadGLTF(path, view){
        let loader = new GLTFLoader();
        loader.load(path, (gltf) => {
            view.charModel = gltf.scene;
            view.charModel.traverse(c => {
                c.castShadow = true;
            });
            this.scene.add(view.charModel);
            if(view.animated){
                view.mixer = new THREE.AnimationMixer(view.charModel);
                view.loadAnimations(gltf.animations);
            }
        },function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        }, (err) => {
            console.log(err);
        });
    }
    loadFBX(path, view){
        let loader = new FBXLoader();
        loader.load(path, (fbx) => {
            view.charModel = fbx;
            view.charModel.traverse(c => {
                c.castShadow = true;
            });
            this.scene.add(view.charModel);
            view.mixer = new THREE.AnimationMixer(view.charModel);
            view.animations = fbx.animations;
        },function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        }, (err) => {
            console.log(err);
        });
    }
}