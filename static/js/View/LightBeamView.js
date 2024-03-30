import {IView} from "./View.js";
import * as THREE from "three";

//yellow light beam colors:
//primaryColor: 0xFFD73D
//secondaryColor: 0xFFB23D

//square:
//cutoff: 0.6

class LightBeamView extends IView{
    constructor(params) {
        super(params);
    }

    createMaterial(primaryColor, secondaryColor, cutoff){
        const uniforms = {
            time: {value : 0},
            primaryColor: {value: primaryColor},
            secondaryColor: {value: secondaryColor},
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
                if(vPosition.y < - cutoff){
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