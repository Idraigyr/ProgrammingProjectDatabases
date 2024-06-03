import {RaycastController} from "./RaycastController.js";
import * as THREE from "three";
import {Object3D} from "three";
import {convertWorldToGridPosition} from "../helpers.js";

/**
 * Deprecated class for building manager
 */
export class BuildManager {
    ritualToPlace;
    previewMaterial;
    #gridCellSize;
    #scene;
    #copyable;
    #previewObject;
    selectedPosition;
    planes = [];
    #raycaster;
    /**
     * Creates objects that controls which ritual to put
     * @param {RaycastController} raycastController raycaster for the builder
     * @param {THREE.Scene} scene scene where to build
     * @param {number} gridCellSize length of the grid square side
     * @param previewMaterial Material of the ritual preview
     */
    // TODO: connect gridcellsize from here to the gridcellsize of the terrain
    // TODO: if center NOT 0,0,0 + rotation
    constructor(raycastController, scene, gridCellSize= 10, previewMaterial=undefined) {
        this.#gridCellSize = gridCellSize;
        this.#raycaster = raycastController; //TODO: remove this: this is responsibility of spellcaster
        this.#scene = scene;
        if(!previewMaterial){
            previewMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
        }
        this.setPreviewMaterial(previewMaterial);
        document.addEventListener('callBuildManager', this.buildActionCaller.bind(this));
        document.addEventListener("infoAboutSelectedCell", this.buildActionHandler.bind(this));
        document.addEventListener('turnPreviewSpell', this.turnPreviewSpell.bind(this));
        // window.addEventListener("message", this.messageListener.bind(this));
    }
    messageListener(event){
        if(event.data.type === "placeBuilding"){
            // Get the building name from the event
            const buildingName = event.data.buildingName;
            // Create a custom event to place the building (send the event to world manager)
            const customEvent = new CustomEvent('placeBuilding', {detail: {buildingName: buildingName, position: this.selectedPosition, withTimer: true}});
            document.dispatchEvent(customEvent);
        }
    }
    addBuildPlane(plane){
        this.planes.push(plane);
    }
    makePreviewObjectInvisible(){
        this.#previewObject.visible = false;
    }

    setPreviewMaterial(material){
        this.previewMaterial = material;
    }
    setCurrentRitual(ritual, copyable=false){
        this.ritualToPlace = ritual;
        this.#copyable = copyable;
        this.scaleAndCorrectPosition(ritual);
        // Set overmesh
        this.#previewObject = this.#extractObject(ritual).clone();
        this.#previewObject.traverse((o) => {
            if (o.isMesh) o.material = this.previewMaterial;
        })
        this.#scene.add(this.#previewObject);
    }
    scaleAndCorrectPosition(object){
        let extracted = this.#extractObject(object)
        this.correctRitualScale(extracted);
        this.correctRitualPosition(extracted);
    }

    #extractObject(object){
        if(!object || object instanceof Object3D) return object;
        const {_, view} = this.#raycaster.viewManager.getPair(object);
        if(view) return view.charModel;
        return object.charModel;
    }
    correctRitualPosition(object){
        convertWorldToGridPosition(object.position);
        const boundingBox = new THREE.Box3().setFromObject(object);
        object.position.add(new THREE.Vector3(0,-boundingBox.min.y,0));
    }

    correctRitualScale(object){
        let boundingBox = new THREE.Box3().setFromObject(object);
        const minVec = boundingBox.min;
        const maxVec = boundingBox.max;
        const difVec = maxVec.sub(minVec);
        const biggestSideLength = Math.max(Math.abs(difVec.x), Math.abs(difVec.z));
        const scaleFactor = this.#gridCellSize/biggestSideLength;
        object.scale.set(scaleFactor*object.scale.x, scaleFactor*object.scale.y, scaleFactor*object.scale.z);
    }

    updateBuildSpell(event){
        let collision = this.#raycaster.getIntersects(this.#raycaster.viewManager.planes)?.[0];
        if(collision){
            this.#previewObject.visible = true;
            this.#extractObject(this.#previewObject).position.copy( collision.point ).add( collision.face.normal );
            this.scaleAndCorrectPosition(this.#previewObject);
        }
    }
    turnPreviewSpell(event){
        if(!this.#previewObject) return;
        this.#previewObject.rotation.y += Math.PI/2;
    }

    buildActionCaller(event){
        if(!this.#raycaster.getIntersects(this.#raycaster.viewManager.planes)) return;
        this.selectedPosition = event.detail.params.position;
        document.dispatchEvent(new CustomEvent('useSelectedCell', {detail: {position: this.selectedPosition,
            direction: event.detail.params.direction, caller: this, subSpell: event.detail.params.subSpell}}));
    }
    buildActionHandler(event){
        // The event is not from this object
        if(event.detail.caller !== this) return;
        // If subSpell, dispatch different menu's
        if(event.detail.subSpell){
            // Get the name of the class
            let objectOnCell = event.detail.building?.constructor.name;
            switch (objectOnCell) {
                case "Altar":
                    document.dispatchEvent(new CustomEvent('openAltarMenu', {detail: {}}));
                    break;
                case "Mine":
                    document.dispatchEvent(new CustomEvent('openMineMenu', {detail: {}}));
                    break;
                case "Tower":
                    document.dispatchEvent(new CustomEvent('openTowerMenu', {detail: {}}));
                    break;
                case "FusionTable":
                    document.dispatchEvent(new CustomEvent('openFusionTableMenu', {detail: {}}));
                    break;
            }
            return;
        }
        // If the cell is not occupied, open the build menu
        if(!event.detail.occupied) {
            document.dispatchEvent(new CustomEvent('openBuildMenu', {detail: {}}));
            return;
        }
        // If the cell is occupied, check if the building is copyable
        else{
            // If there is already model selected, return
            if(this.ritualToPlace) return;
            // Change model of the ritual to place in the event
            this.ritualToPlace = event.detail.building;
        }
        return;
    }

}