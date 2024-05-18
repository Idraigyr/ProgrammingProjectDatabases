import {IView} from "./View.js";
import * as THREE from "three";
import {gridCellSize} from "../configs/ViewConfigs.js";
import { TextGeometry } from 'three-TextGeometry';
import { setPositionOfCentre} from "../helpers.js";

/**
 * Class representing a watch
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
        console.log('Time: ', Math.floor(this.#previousTime), Math.floor(time));
        console.log('Time: ', this.#previousTime, time);
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