import {IView} from "./View.js";
import * as THREE from "three";
import {gridCellSize} from "../configs/ViewConfigs.js";
import { TextGeometry } from 'three-TextGeometry';
import { setPositionOfCentre} from "../helpers.js";

/**
 * Class representing a watch - DEPRECATED
 */
export class Watch extends IView{
    currentTime;
    #previousTime;
    constructor(params) {
        super(params);
        this.currentTime = params.time??0;
        this.scene = params.scene;
        this.font = params.font;
        this.material = new THREE.MeshBasicMaterial({color: 0xffffff})
        this.#previousTime = 0;
        // this.numbers = [];
        this.setTimeView(this.currentTime);
        // this.#createNumbers();
    }

    // #createNumbers(){
    //     for(let i = 0; i < 10; i++){
    //         let textGeometry = new TextGeometry(i.toString(), {
    //             font: this.font,
    //             size: gridCellSize/5,
    //             height: gridCellSize/10,
    //         });
    //         let mesh = new THREE.Mesh(textGeometry, this.material);
    //         this.numbers.push(mesh);
    //     }
    //     // Add :
    //     let textGeometry = new TextGeometry(':', {
    //         font: this.font,
    //         size: gridCellSize/5,
    //         height: gridCellSize/10,
    //     });
    //     let mesh = new THREE.Mesh(textGeometry, this.material);
    //     this.numbers.push(mesh);
    // }

    /**
     * Set time view
     * @param time {number} - time in seconds
     */
    setTimeView(time){
        // Quick fix to update only per second
        if( Math.floor(this.#previousTime) === Math.floor(time)) {
            if(this.charModel){
                setPositionOfCentre(this.charModel, this.position);
                this.charModel.position.set(this.charModel.position.x, gridCellSize/2, this.charModel.position.z);
            }
            return;
        }
        this.#previousTime = time;
        // Transform seconds to hours, minutes and seconds string
        let hours = Math.floor(time / 3600);
        let minutes = Math.floor((time % 3600) / 60);
        let seconds = Math.floor(time % 60);
        // Add leading zeros to hours, minutes and seconds
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        // Unite hours, minutes and seconds in a string
        let timeString = hours + ':' + minutes + ':' + seconds;
        // // Create Three.js group
        // if(this.charModel){
        //     this.scene.remove(this.charModel);
        // }
        // this.charModel = new THREE.Group();
        // // Iterate over symbols:
        // for(let i = 0; i < timeString.length; i++){
        //     let number = parseInt(timeString[i]);
        //     // Let's check : case
        //     if(timeString[i] === ':'){
        //         number = 10;
        //     }
        //     // Clone the number
        //     let clone = this.numbers[number].clone();
        //     clone.position.set(this.position.x + i * gridCellSize/8, gridCellSize/2, this.position.z);
        //     setPositionOfCentre(this.charModel, this.position);
        //     this.charModel.add(clone);
        //     // this.numbers[number].position.set(this.position.x + i * gridCellSize/2, this.position.y, this.position.z);
        //     // this.scene.add(this.numbers[number]);
        // }
        // Create Three.js text geometry
        let textGeometry = new TextGeometry(timeString, {
            font: this.font,
            size: gridCellSize/5,
            height: gridCellSize/10,
        });
        if(!this.charModel){
            this.charModel = new THREE.Mesh(textGeometry, this.material);
            // // Calculate position of the watch, so that the centre of text = position
            setPositionOfCentre(this.charModel, this.position);
            this.charModel.position.set(this.charModel.position.x, gridCellSize/2, this.charModel.position.z);
            this.scene.add(this.charModel);
        }else{
            this.charModel.geometry = textGeometry;
            setPositionOfCentre(this.charModel, this.position);
            this.charModel.position.set(this.charModel.position.x, gridCellSize/2, this.charModel.position.z);
        }
    }
}

/**
 * Class representing a 3D text timer
 * @extends IView
 * needs to be placed immediately in dyingViews of ViewManager
 */
export class Timer3D extends IView{
    constructor(params) {
        super(params);
        this.currentTime = params.time;
        this.currentRotation = params?.rotation ?? 0;
        this.rotationSpeed = params?.rotationSpeed ?? 1;
        this.charAccess = params.charAccess;

        this.charWidth = params.charWidth;
        this.textSpacing = params?.textSpacing ?? 1;
        this.colour = params?.colour ?? null;
    }


    /**
     * Update bounding box - empty override function, not needed for timer
     */
    updateBoundingBox(){
        // no need to update bounding box
    }

    /**
     * Clean up the view for deletion
     */
    dispose() {
        try {
            this.boxHelper.parent.remove(this.boxHelper);
        } catch (err){
            console.log("BoxHelper not added to scene.");
        }
        this.charAccess.freeAssets();
    }

    /**
     * returns a string representation of the time
     * @param {number} time
     * @return {string}
     */
    #getTimerString(time){
        time = Math.round(time)
        let hours = Math.floor(time / 3600);
        let minutes = Math.floor((time % 3600) / 60);
        let seconds = Math.floor(time % 60);
        // Add leading zeros to hours, minutes and seconds
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        return hours + ":" + minutes + ":" + seconds;
    }

    /**
     * Update the view
     * @param deltaTime - time since last update
     * @param camera - camera to update view
     */
    update(deltaTime, camera) {
        this.currentTime -= deltaTime;
        this.currentRotation += this.rotationSpeed * deltaTime;
        const timeString = this.#getTimerString(this.currentTime);
        let newCharCounter = {
            "0": 0,
            "1": 0,
            "2": 0,
            "3": 0,
            "4": 0,
            "5": 0,
            "6": 0,
            "7": 0,
            "8": 0,
            "9": 0,
            ":": 0
        }

        for(let i = 0; i < timeString.length; i++){
            let char = timeString.charAt(i);
            let index = this.charAccess.getIndex(char);
            newCharCounter[char]++;

            // construct translation & rotation matrix
            let matrix = new THREE.Matrix4();
            let rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationY(this.currentRotation);
            let translationMatrix = new THREE.Matrix4();
            translationMatrix.makeTranslation(this.position.x, this.position.y, this.position.z);
            matrix.copy(translationMatrix);
            translationMatrix.makeTranslation((i - timeString.length / 2) * (this.textSpacing + this.charWidth), 0, 0);
            matrix.multiply(rotationMatrix);
            matrix.multiply(translationMatrix);

            if(this.colour){
                this.charAccess.meshes.get(char).setColorAt(index, this.colour);
                this.charAccess.meshes.get(char).instanceColor.needsUpdate = true;
            }
            this.charAccess.meshes.get(char).setMatrixAt(index, matrix);
            this.charAccess.meshes.get(char).instanceMatrix.needsUpdate = true;
            this.charAccess.meshes.get(char).computeBoundingSphere();
        }
    }

    /**
     * Check if Timer3D is not dead
     * @param deltaTime time passed since last update
     * @param camera camera to update view
     * @returns {boolean} true if Timer3D is not dead
     */
    isNotDead(deltaTime, camera){
        if(this.currentTime <= 0){
            this.dispose();
            return false;
        }
        this.update(deltaTime, camera);
        return true;
    }

    /**
     * Update position of the view
     * @param event - event with position
     */
    updatePosition(event){
        if(!this.charModel) return;
        const delta = new THREE.Vector3().subVectors(event.detail.position, this.position);
        this.position.copy(event.detail.position);
    }

    /**
     * Update rotation of the view - empty override function, not needed for timer
     * @param event - event with rotation
     */
    updateRotation(event){
    }
}