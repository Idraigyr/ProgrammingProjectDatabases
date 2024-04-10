import {IView} from "./View.js";
import * as THREE from "three";
import {fontPaths, gridCellSize} from "../configs/ViewConfigs.js";
import { FontLoader } from 'three-FontLoader';
import { TextGeometry } from 'three-TextGeometry';

export class Watch extends IView{
    #currentTime;
    constructor(params) {
        super(params);
        this.#currentTime = params.time??0;
        this.scene = params.scene;
        this.setTimeView(this.#currentTime);
    }
    // update current time
    updateCurrentTime(time){
        this.#currentTime = time;
    }
    setTimeView(time){
        this.#currentTime = time;
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
        // Load font for three.js text geometry
        let loader = new FontLoader();
        const font = loader.load(fontPaths.Surabanglus, (font) => {
            console.log(font);
            // Create Three.js text geometry
        let textGeometry = new TextGeometry(timeString, {
            font: font,
            size: gridCellSize/5,
            depth: 0.1,
            // curveSegments: gridCellSize,
            // bevelEnabled: true,
            // bevelThickness: gridCellSize,
            // bevelSize: gridCellSize,
            // bevelOffset: 0,
            // bevelSegments: gridCellSize/2
        });
        this.charModel = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({color: 0xffffff}));
        console.log("Watch created!");
        console.log("Position: ", this.position);
        this.charModel.position.set(this.position.x, gridCellSize/2, this.position.z);
        //this.scene.add(this.charModel);
        });
    }
}