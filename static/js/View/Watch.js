import {IView} from "./View.js";
import * as THREE from "three";
import {gridCellSize} from "../configs/ViewConfigs.js";
import { TextGeometry } from 'three-TextGeometry';
import { setPositionOfCentre} from "../helpers.js";

export class Watch extends IView{
    currentTime;
    constructor(params) {
        super(params);
        this.currentTime = params.time??0;
        this.scene = params.scene;
        this.font = params.font;
        this.setTimeView(this.currentTime);
    }
    // update current time
    updateCurrentTime(time){
        this.currentTime = time;
    }
    setTimeView(time){
        // Quick fix to update only per second
        if( Math.floor(this.currentTime % 60) === Math.floor(time % 60)) {
            if(this.charModel){
                setPositionOfCentre(this.charModel, this.position);
                this.charModel.position.set(this.charModel.position.x, gridCellSize/2, this.charModel.position.z);
            }
            return;
        }
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
        // Create Three.js text geometry
        let textGeometry = new TextGeometry(timeString, {
            font: this.font,
            size: gridCellSize/5,
            height: gridCellSize/10,
            // curveSegments: gridCellSize,
            // bevelEnabled: true,
            // bevelThickness: gridCellSize,
            // bevelSize: gridCellSize,
            // bevelOffset: 0,
            // bevelSegments: gridCellSize/2
        });
        if(!this.charModel){
            this.charModel = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({color: 0xffffff}));
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