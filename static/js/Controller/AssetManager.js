import {
    assetPaths,
    buildingAssetsKeys,
    charsReservedForTimer,
    gridCellSize,
    minCharCount
} from "../configs/ViewConfigs.js";
import {Controller} from "./Controller.js";
import * as THREE from "three";
import {clone} from "three-SkeletonUtils";
import {correctRitualScale} from "../helpers.js";
import { TextGeometry } from 'three-TextGeometry';

/**
 * Class to manage assets
 */
export class AssetManager{
    #assetList;
    #assetLoader;
    #instancedCharModels;
    #reservedChars;
    constructor() {
        this.#assetLoader = new Controller.AssetLoader();
        this.#assetList = {};
        this.#instancedCharModels = new Map();
        this.#reservedChars = new Map();
        for(const key in minCharCount){
            this.#instancedCharModels.set(key, null);
            this.#reservedChars.set(key, {
                reserved: 0,
                occupied: 0,
                count: minCharCount[key]
            });
        }
        this.buildingKeys = buildingAssetsKeys;
    }

    /**
     * Load the 3d models and their animations
     * @returns {Promise<void>} a promise that resolves when all the models are loaded
     */
    async loadViews(){
        let promises = [];
        for(const key in assetPaths) {
            promises.push(this.#assetLoader.loadAsset(assetPaths[key]));
        }
        await Promise.all(promises).then((values) => {
            let index = 0;
            for(const key in assetPaths) {
                const {charModel = null, animations = null, texture = null, font = null} = values[index];
                this.#assetList[key] = {};

                if(charModel){
                    //TODO: move out of manager and into loader
                    if(this.buildingKeys.includes(key)){
                        correctRitualScale(charModel);
                        const box = new THREE.Box3().setFromObject(charModel);
                        box.setFromObject(charModel,true);
                        const c = box.getCenter( new THREE.Vector3( ) );
                        c.y = box.min.y;
                        charModel.position.add(new THREE.Vector3().sub(c));
                        let group = new THREE.Group();
                        group.add(charModel);
                        this.#assetList[key].model = group;
                    } else {
                        this.#assetList[key].model = charModel;
                    }
                }
                if(animations){
                    this.#assetList[key].animations = animations;
                }
                if(texture){
                    this.#assetList[key].texture = texture;
                }
                if(font){
                    this.#assetList[key].font = font;
                }
                index++;
            }
        });
    }

    /**
     * Create a model for a 3d text
     * @param {string} char - 3d text to create
     * @param {string} font - the key of the font to use for the text, requires it to be loaded in already with the loadViews method
     * @param {number} count - the number of instances to reserve for this text
     * @return {THREE.InstancedMesh}
     */
    #createTextModel(char, font, count){
        const geo = new TextGeometry(char, {
            font: this.getAsset(font),
            size: gridCellSize/5,
            height: gridCellSize/10,
            // curveSegments: gridCellSize,
            // bevelEnabled: true,
            // bevelThickness: gridCellSize,
            // bevelSize: gridCellSize,
            // bevelOffset: 0,
            // bevelSegments: gridCellSize/2
        });
        return new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({color: 0xffffff}), count);
    }

    /**
     * creates THREE.InstancedMesh'es for all characters that need to be displayed in a timer
     * @param {Object} charCounts - the max number of instances reserved for each character, is an object with the characters as keys and the max number of instances as values
     * when more instances are needed a new THREE.InstancedMesh will be created with a higher count of currentCount*2
     * @param {string} font - the key of the font to use for the timer, requires it to be loaded in already with the loadViews method
     * @param {THREE.Scene} scene - the scene to add the instancedMeshes to
     */
    createTimerViews(charCounts, font,scene){
        let counter = 0;
        this.#instancedCharModels.forEach((value, key) => {
            counter++;
            this.#instancedCharModels.set(key, this.#createTextModel(key, font, charCounts[key]));
            scene.add(this.#instancedCharModels.get(key));
            this.#instancedCharModels.get(key).count = 0;
        });
    }

    /**
     * Request assets for a timer, will allocate a number of consecutive instances in the THREE.InstancedMesh'es in this.#instancedCharModels for all characters required for a timer
     * @return {{meshes, getIndex: function, freeAssets}} - freeAssets is a function that needs to be called to free the allocated instances (when timer is done rendering),
     * getIndex is a function that needs to be called to get an index used for accessing an instance in the instancedMeshes in meshes
     */
    requestTimerAssets(){
        let result = {
            meshes: this.#instancedCharModels,
            getIndex: null,
            freeAssets: null
        };
        for(const key in charsReservedForTimer){ //loop over all chars that need to be reserved
            if(this.#reservedChars.get(key).count - this.#reservedChars.get(key).reserved < charsReservedForTimer[key]) { // create new InstancedMesh if there are not enough instances left
                throw new Error(`not enough instances available for ${key}`);
                // let newMesh = this.#createTextModel(key, "SurabanglusFont", this.#reservedChars.get(key).count*2);
                // let oldMesh = this.#instancedCharModels.get(key);
                // //TODO: copy all transformations from old mesh to new mesh + remove/add old/new mesh to scene
                // this.#instancedCharModels.set(key,newMesh);
            } else {
                this.#reservedChars.get(key).reserved += charsReservedForTimer[key];
            }
        }
        result.freeAssets = () => {
            for(const key in charsReservedForTimer){
                this.#reservedChars.get(key).reserved -= charsReservedForTimer[key];
            }
        }
        //access function for instancedMeshes
        result.getIndex = this.#getAccessibleCharIndex.bind(this);
        return result;
    }

    /**
     * requests use of an instance in the instancedMesh of a character, this function can only be accessed on the return object of requestTimerAssets
     * @param {string} char - the char you want to request and index for
     * @return {number} - the index of the reserved instance
     */
    #getAccessibleCharIndex(char){
        let newCount = this.#reservedChars.get(char);
        if(newCount.occupied >= newCount.reserved) throw new Error(`not enough instances reserved for ${char}`);
        this.#instancedCharModels.get(char).count = ++newCount.occupied;
        return newCount.occupied - 1;
    }

    /**
     * free occupied instances of characters. call this function after frame is rendered to reset InstancedMesh counts
     */
    resetCharCounts(){
        for(const key in minCharCount){
            this.#reservedChars.get(key).occupied = 0;
            this.#instancedCharModels.get(key).count = 0;
        }
    }

    /**
     * Get a clone of a 3d model
     * @param {string} name name of the model
     * @returns {*} the 3d model
     */
    getAsset(name){
        if(this.#assetList[name]) {
            if (this.#assetList[name].model) {
                return clone(this.#assetList[name].model);
            } else if (this.#assetList[name].texture) {
                return this.#assetList[name].texture.clone();
            } else if (this.#assetList[name].font) {
                return this.#assetList[name].font;
            }
            throw new Error(`no asset exists for ${name}.`);
        }
    }

    /**
     * Get the animations of a 3d model
     * @param {string} name name of the model
     * @returns {*} the animations
     */
    getAnimations(name){
        if(this.#assetList?.[name].animations){
            return this.#assetList[name].animations;
        } else {
            throw new Error(`no animations exists for ${name}.`);
        }
    }
}