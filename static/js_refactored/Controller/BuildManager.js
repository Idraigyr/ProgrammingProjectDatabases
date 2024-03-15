import {RaycastController} from "./RaycastController.js";
import * as THREE from "three";
import {Object3D} from "three";

export class BuildManager {
    ritualToPlace;
    previewMaterial;
    #gridCellSize;
    #previewObject;
    planes = [];
    #raycaster;
    /**
     * Creates objects that controls which ritual to put
     * @param raycastController raycaster for the builder
     * @param gridCellSize length of the grid square side
     * @param previewMaterial Material of the ritual preview
     */
    // TODO: connect gridcellsize from here to the gridcellsize of the terrain
    // TODO: if center NOT 0,0,0 + rotation
    constructor(raycastController, gridCellSize= 10, previewMaterial=undefined) {
        this.#gridCellSize = gridCellSize;
        this.#raycaster = raycastController;
        if(!previewMaterial){
            previewMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true });
        }
        this.setPreviewMaterial(previewMaterial);
        document.addEventListener('placeBuildSpell', this.placeBuildSpell.bind(this));
    }
    addBuildPlane(plane){
        this.planes.push(plane);
    }
    setPreviewMaterial(material){
        this.previewMaterial = material;
    }
    setCurrentRitual(ritual){
        this.ritualToPlace = ritual;
    }
    scaleAndCorrectPosition(object){
        let extracted = this.#extractObject(object)
        this.correctRitualScale(extracted);
        this.correctRitualPosition(extracted);
    }

    #extractObject(object){
        if(!object || object instanceof Object3D) return;
        // TODO: get model by the address
        let view = this.#raycaster.viewManager.getPair(object)
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
            this.#extractObject(this.ritualToPlace).position.copy( collision.point ).add( collision.face.normal );
            this.scaleAndCorrectPosition(this.ritualToPlace);
        }
    }
    placeBuildSpell(event){
        // let closedCollided = this.#raycaster.getIntersects(this.#raycaster.viewManager.ritualTouchables)?.[0];
        // if(closedCollided){
        //     let object = closedCollided.object;
        //     let planes = this.#raycaster.viewManager.planes;
        //     if(planes.indexOf(object) === -1){
        //         console.log("touched plane");
        //         return;
        //     }else{
        //         console.log("touched something else");
        //         return;
        //     }
        //     object.position.copy( closedCollided.point ).add( closedCollided.face.normal );
        //     this.scaleAndCorrectPosition(object);
        //     // TODO: just put them on the ground
        //     // TODO: just add transparency roll over mesh logic
        //     // TODO: just say 'Finally!'
        // }
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