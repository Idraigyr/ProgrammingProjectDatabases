import {RaycastController} from "./RaycastController.js";
import * as THREE from "three";
import {Object3D} from "three";
import {drawBoundingBox} from "../helpers.js";

export class BuildManager {
    ritualToPlace;
    previewMaterial;
    defaultPreviewObject;
    #gridCellSize;
    #scene;
    #spellFactory;
    #copyable;
    planes = [];
    #raycaster;
    /**
     * Creates objects that controls which ritual to put
     * @param spellFactory factory for the build spells
     * @param raycastController raycaster for the builder
     * @param scene scene where to build
     * @param gridCellSize length of the grid square side
     * @param previewMaterial Material of the ritual preview
     */
    // TODO: connect gridcellsize from here to the gridcellsize of the terrain
    // TODO: if center NOT 0,0,0 + rotation
    constructor(spellFactory, raycastController, scene, gridCellSize= 10, previewMaterial=undefined) {
        this.#spellFactory = spellFactory;
        this.#gridCellSize = gridCellSize;
        this.#raycaster = raycastController;
        this.#scene = scene;
        if(!previewMaterial){
            previewMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
        }
        this.setPreviewMaterial(previewMaterial);
        document.addEventListener('placeBuildSpell', this.placeBuildSpell.bind(this));
        document.addEventListener('turnPreviewSpell', this.turnPreviewSpell.bind(this));
        document.addEventListener('assetsLoaded', this._setDefaultPreviewObject.bind(this));
    }

    /**
     * Sets the default preview object (currently a green cube)
     * @private function to be called in the constructor
     */
    _setDefaultPreviewObject(){
        this.defaultPreviewObject = this.#spellFactory.createRitualSpell({spellType: 'buildSpell'});
        this.setCurrentRitual(this.defaultPreviewObject);
    }
    addBuildPlane(plane){
        this.planes.push(plane);
    }
    makePreviewObjectInvisible(){
        if (!this.ritualToPlace) return;
        this.ritualToPlace.visible = false;
    }

    setPreviewMaterial(material){
        this.previewMaterial = material;
    }
    setCurrentRitual(ritual, copyable=false){
        this.ritualToPlace = this.#extractObject(ritual);
        this.#copyable = copyable;
        this.scaleAndCorrectPosition(this.ritualToPlace);
        this.#scene.add(this.ritualToPlace);
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
        object.position.x = Math.floor(object.position.x/this.#gridCellSize)*this.#gridCellSize + this.#gridCellSize/2.0;
        object.position.z = Math.floor(object.position.z/this.#gridCellSize)*this.#gridCellSize + this.#gridCellSize/2.0;
        const boundingBox = new THREE.Box3().setFromObject(object);
        drawBoundingBox(boundingBox, this.#scene, 0x00ff00);
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
            this.ritualToPlace.visible = true;
            this.#extractObject(this.ritualToPlace).position.copy( collision.point ).add( collision.face.normal );
            this.scaleAndCorrectPosition(this.ritualToPlace);
        }
    }
    turnPreviewSpell(event){
        this.ritualToPlace.rotation.y += Math.PI/2;
    }
    placeBuildSpell(event){
        if(this.ritualToPlace === this.#extractObject(this.defaultPreviewObject)){
            // Call event to open build menu
            document.dispatchEvent(new CustomEvent('openBuildMenu', {detail: {position: this.ritualToPlace.position}}));
            return;
        }
        if(!this.ritualToPlace) return;
        let extracted = this.#extractObject(this.ritualToPlace);
        if(this.#copyable) {
            extracted = extracted.clone(true);
            this.#scene.add(extracted);
        }
        extracted.position.copy( this.ritualToPlace.position );
        extracted.rotation.y = this.ritualToPlace.rotation.y;
        this.scaleAndCorrectPosition(this.ritualToPlace);
    }
}