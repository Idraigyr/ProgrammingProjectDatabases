import {FBXLoader, GLTFLoader} from "three/addons";
import * as THREE from "three";
import * as model from "../../js/model";

export class AssetLoader{
    constructor(scene) {
        this.scene = scene;
    }
    loadGLTF(path, view){
        let loader = new GLTFLoader();
        loader.load(path, (gltf) => {
            view.charModel = gltf.scene;
            console.log(view);
            view.charModel.traverse(c => {
                c.castShadow = true;
            });
            this.scene.add(view.charModel);
            view.mixer = new THREE.AnimationMixer(model);
            view.animations = gltf.animations;
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
            view.mixer = new THREE.AnimationMixer(model);
            view.animations = fbx.animations;
        },function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        }, (err) => {
            console.log(err);
        });
    }
}