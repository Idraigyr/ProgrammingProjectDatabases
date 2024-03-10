import {RaycastController} from "./RaycastController.js";
import * as THREE from "three";

export class RitualController extends RaycastController{
    ritualToPlace;
    previewMaterial;
    #gridCellSize;
    /**
     * Creates objects that controls which ritual to put
     * @param plane Plane on which the objects could be placed
     * @param gridCellsize length of the grid square side
     * @param previewMaterial Material of the ritual preview
     */
    // TODO: connect gridcellsize from here to the gridcellsize of the terrain
    constructor(plane, gridCellsize= 10, previewMaterial=undefined) {
        super(plane);
        this.#gridCellSize = gridCellsize;
        if(!previewMaterial){
            previewMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
        }
        this.setPreviewMaterial(previewMaterial);
    }
    setPreviewMaterial(material){
        this.previewMaterial = material;
    }
    setCurrentRitual(ritual){
        this.ritualToPlace = ritual;
    }
    scaleAndCorrectPosition(object){
        this.correctRitualScale(object);
        this.correctRitualPosition(object);
    }
    // TODO: refactor the code below
    // correctRitualPosition(object){
    //     object.position.x = Math.floor(object.position.x/this.#gridCellSize)*this.#gridCellSize + this.#gridCellSize/2.0;
    //     object.position.z = Math.floor(object.position.z/this.#gridCellSize)*this.#gridCellSize + this.#gridCellSize/2.0;
    //     const boundingBox = new THREE.Box3().setFromObject(object);
    //     object.position.add(new THREE.Vector3(0,-boundingBox.min.y,0));
    // }
    //
    // correctRitualScale(object){
    //     let boundingBox = new THREE.Box3().setFromObject(object);
    //     const minVec = boundingBox.min;
    //     const maxVec = boundingBox.max;
    //     const difVec = maxVec.sub(minVec);
    //     const biggestSideLength = Math.max(Math.abs(difVec.x), Math.abs(difVec.z));
    //     const scaleFactor = this.#gridCellSize/biggestSideLength;
    //     object.scale.set(scaleFactor*object.scale.x, scaleFactor*object.scale.y, scaleFactor*object.scale.z);
    // }
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