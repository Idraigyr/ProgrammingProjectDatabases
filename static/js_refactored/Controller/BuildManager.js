import {RaycastController} from "./RaycastController.js";
import * as THREE from "three";
import {Object3D} from "three";

export class BuildManager {
    ritualToPlace;
    previewMaterial;
    #gridCellSize;
    #scene;
    #copyable;
    #previewObject;
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
        document.addEventListener('placeBuildSpell', this.placeBuildSpell.bind(this));
        document.addEventListener('turnPreviewSpell', this.turnPreviewSpell.bind(this));
    }
    addBuildPlane(plane){
        this.planes.push(plane);
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
        let view = this.#raycaster.viewManager.getPair(object);
        if(view) return view.charModel;
        return object.charModel;
    }
    correctRitualPosition(object){
        object.position.x = Math.floor(object.position.x/this.#gridCellSize)*this.#gridCellSize + this.#gridCellSize/2.0;
        object.position.z = Math.floor(object.position.z/this.#gridCellSize)*this.#gridCellSize + this.#gridCellSize/2.0;
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
            this.#extractObject(this.#previewObject).position.copy( collision.point ).add( collision.face.normal );
            this.scaleAndCorrectPosition(this.#previewObject);
        }
    }
    turnPreviewSpell(event){
        this.#previewObject.rotation.y += Math.PI/2;
    }
    placeBuildSpell(event){
        if(!this.ritualToPlace) return;
        let extracted = this.#extractObject(this.ritualToPlace);
        if(this.#copyable) {
            extracted = extracted.clone(true);
            this.#scene.add(extracted);
        }
        extracted.position.copy( this.#previewObject.position );
        extracted.rotation.y = this.#previewObject.rotation.y;
        this.scaleAndCorrectPosition(this.ritualToPlace);
    }
    // TODO: refactor the code below
    //
    // /**
    //  * Shows roll mesh overlay (preview of the object to build)
    //  * @param event mouse movement event
    //  */
    // ritualManipulator(event){
    //     if(!enableBuilding || rollOverMesh === undefined) return;
    //     raycaster.setFromCamera( new THREE.Vector2(0,0), camera );
    //     const intersects = this.intersectObjects( this.touchableObjects, true );
	// 			if ( intersects.length > 0 ) {
    //
	// 				const intersect = intersects[ 0 ];
    //
	// 				rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
    //                 this.correctRitualPosition(rollOverMesh);
	// 			}
    // }
    // ritualBuilder(event){
    //     if(!enableBuilding || !currentThingToPlace.getModel()) return;
    //     // For object rotation. TODO: encapsulate in an apart function?
    //     if(event.which === 3 || event.button === 2){
    //         rollOverMesh.rotation.y += Math.PI/2;
    //         currentThingToPlace.getModel().rotation.y += Math.PI/2;
    //         return;
    //     }
    //     if( this.#input.keys.build ){
    //                     //pointer.set( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1 );
    //                     raycaster.setFromCamera( new THREE.Vector2(0,0), camera );
    //                     const intersects = raycaster.intersectObjects( touchableObjects, true );
    //                     if (intersects.length > 0 ){
    //                         const intersect = intersects[0];
    //                         if(intersect.object !== this.plane){
    //                             console.log("object touched");
    //                             intersect.object.parent.position.copy( intersect.point ).add( intersect.face.normal );
    //                             updateObjectToPlace(intersect.object.parent.parent);
    //                             return;
    //                         }
    //                         let smth = currentThingToPlace.getModel();
    //                         const voxel = smth.clone();
    //                         voxel.position.copy( intersect.point ).add( intersect.face.normal );
    //                         this.scaleAndCorrectPosition(voxel);
    //                         // TODO: voxel for further interaction
    //                         // touchableObjects.push(voxel);
    //                         scene.add( voxel );
    //                     }
    //                 }
    // }
}