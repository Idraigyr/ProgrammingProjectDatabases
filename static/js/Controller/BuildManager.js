import {RaycastController} from "./RaycastController.js";
import * as THREE from "three";
import {Object3D} from "three";
import {convertWorldToGridPosition} from "../helpers.js";

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
     * @param raycastController raycaster for the builder
     * @param scene scene where to build
     * @param gridCellSize length of the grid square side
     * @param previewMaterial Material of the ritual preview
     */
    // TODO: connect gridcellsize from here to the gridcellsize of the terrain
    // TODO: if center NOT 0,0,0 + rotation
    constructor(raycastController, scene, gridCellSize= 10, previewMaterial=undefined) {
        this.#gridCellSize = gridCellSize;
        this.#raycaster = raycastController;
        this.#scene = scene;
        if(!previewMaterial){
            previewMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
        }
        this.setPreviewMaterial(previewMaterial);
        document.addEventListener('callBuildManager', this.placeBuildSpell.bind(this));
        document.addEventListener('turnPreviewSpell', this.turnPreviewSpell.bind(this));
        window.addEventListener("message", this.messageListener.bind(this));
    }
    messageListener(event){
        if(event.data.type === "placeBuilding"){
            // Get the building name from the event
            const buildingName = event.data.buildingName;
            // Create a custom event to place the building (send the event to world manager)
            const customEvent = new CustomEvent('placeBuilding', {detail: {buildingName: buildingName, position: this.selectedPosition}});
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
    placeBuildSpell(event){
        // if(!this.ritualToPlace) return;
        // let extracted = this.#extractObject(this.ritualToPlace);
        // if(this.#copyable) {
        //     extracted = extracted.clone(true);
        //     this.#scene.add(extracted);
        // }
        // extracted.position.copy( this.#previewObject.position );
        // extracted.rotation.y = this.#previewObject.rotation.y;
        // this.scaleAndCorrectPosition(this.ritualToPlace);
        if(!this.ritualToPlace && this.#raycaster.getIntersects(this.#raycaster.viewManager.planes)?.[0]) {
            document.dispatchEvent(new CustomEvent('openBuildMenu', {detail: {}}));
            // Save current selected position
            this.selectedPosition = event.detail.params.position;
            console.log("Current selected position: ", this.selectedPosition);
        }
    }

}