import {Building} from "../BuildingView.js";
import {treePath} from "../../configs/ViewConfigs.js";
import * as THREE from "three";
import {GLTFLoader} from "three-GLTFLoader";

export class Tree extends Building{
    constructor() {
        super();
        this.assetPath = treePath;
    }
    initModel(){
        // TODO: remove this temporary solution. Call island #addBuildingList instead?
        let loader = new GLTFLoader();
        loader.load(this.assetPath, (gltf) => {
            this.charModel = gltf.scene;
            this.charModel.traverse(c => {
                c.castShadow = true;
            });
        },function (xhr) {}, (err) => {
            console.log(err);
        });
    }
    updatePosition(event){
        if(!this.charModel) return;
        this.charModel.position.set(event.detail.position.x, event.detail.position.y,event.detail.position.z);
    }
}