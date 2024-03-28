import {IView} from "./View.js";
import * as THREE from "three";
import {convertWorldToGridPosition} from "../helpers.js";

export class PreviewObject extends IView{
    constructor(params) {
        super(params);
        this.types = {};

        for(let i = 0; i < params.length; i++){
            this.types[params[i].key] = params[i].details;
        }
        this.material = this.createMaterial(
            this.types[Object.keys(this.types)[0]].primaryColor,
            this.types[Object.keys(this.types)[0]].secondaryColor,
            this.types[Object.keys(this.types)[0]].cutoff);
        this.charModel = new THREE.Mesh(new this.types[Object.keys(this.types)[0]].ctor(...this.types[Object.keys(this.types)[0]].params), this.material);
    }

    addType(key, type){
        this.types[key] = type;
    }

    render(event){
        const newEvent = {detail: {position: event.detail.params.position}};
        if(!newEvent.detail.position){
            this.charModel.visible = false;
            return;
        }
        this.setModel(event.detail.type.name);
        this.charModel.visible = true;
        if(event.detail.type.name === "build"){
            convertWorldToGridPosition(newEvent.detail.position);
            newEvent.detail.position.y = 0;
        }
        this.updatePosition(newEvent);
        //TODO: remove magic value
        this.charModel.translateY(1.5);
    }

    makeVisible(event){
        this.charModel.visible = event.detail.visible;
    }

    setModel(key){
        this.charModel.geometry = new this.types[key].ctor(...this.types[key].params);
        this.charModel.material.uniforms.primaryColor.value.set(this.types[key].primaryColor);
        this.charModel.material.uniforms.secondaryColor.value.set(this.types[key].secondaryColor);
        this.charModel.material.uniforms.cutoff.value = this.types[key].cutoff;
    }

    update(deltaTime) {
        this.charModel.material.uniforms.time.value += deltaTime*2;
    }

    createMaterial(primaryColor, secondaryColor, cutoff){
        const uniforms = {
            time: {value : 0},
            primaryColor: {value: new THREE.Color(primaryColor)},
            secondaryColor: {value: new THREE.Color(primaryColor)},
            cutoff: {value:cutoff}
        };
        return new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `
            varying vec3 vPosition;
            void main(){
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
        `,
            fragmentShader:`
            uniform float cutoff;
            uniform vec3 primaryColor;
            uniform vec3 secondaryColor;
            const vec3 dark = vec3(0.0,0.0,0.0);
            uniform float time;
            varying vec3 vPosition;
            void main(){
                if(vPosition.y < cutoff){
                    discard;
                }
                float intensity = 0.4 - vPosition.y;
                float wave = sin(1.0 * 3.14159 * vPosition.x + time);
                wave += sin(1.0 * 3.14159 * vPosition.z + time);
                wave += 0.8*sin(2.0 * 3.14159 * vPosition.y + time) - 1.0;
                intensity += 0.1 * wave;
                intensity -= 0.5 * vPosition.y;
                intensity = clamp(intensity,0.0,1.0);
                vec3 lightColor = mix(primaryColor,secondaryColor,intensity);
                gl_FragColor = vec4(mix(dark,lightColor,intensity),1.0);
            }
        `,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
    }
}

//usage
// let preview = new PreviewObject([
//     {key: "box", details: {
//         ctor: THREE.BoxGeometry,
//         params: [3,3,3],
//         primaryColor: 0xFFD73D,
//         secondaryColor: 0xFFB23D,
//         cutoff: 0.6
//     }},
//     {key: "circle", details: {
//         ctor: THREE.CylinderGeometry,
//         params: [3, 3, 1],
//         primaryColor: 0x0051FF,
//         secondaryColor: 0xCCABFF,
//         cutoff: 0.49
//     }
// }]);