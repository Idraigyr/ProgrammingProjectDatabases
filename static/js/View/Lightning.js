import * as THREE from "three";
import {IView} from "./View";

//create a lighting strike class that extends IView, the lighting strike should have a beginning and end point, a inner color and an outer color and a thickness.
// the lightning strike should have a shader material that creates a lightning effect between the two points.
// the lightning bolt should move and change shape over time.

/**
 * @class Lightning - A class that creates a lightning bolt between two points.
 */
class Lightning extends IView{
    constructor(params) {
        super(params);
        this.start = params.start;
        this.end = params.end;
        this.innerColor = params.innerColor;
        this.outerColor = params.outerColor;
        this.thickness = params.thickness;
        this.time = 0;
    }


    /**
     * @method createMaterial - A method that creates a shader material that creates a lightning effect between two points.
     * @returns {ShaderMaterial} - A shader material that creates a lightning effect between two points.
     */
    createMaterial(){
        return new THREE.ShaderMaterial({
            uniforms: {
                time: {value: 0},
                start: {value: this.start},
                end: {value: this.end},
                innerColor: {value: this.innerColor},
                outerColor: {value: this.outerColor},
                thickness: {value: this.thickness}
            },
            vertexShader: `
            varying vec3 vPosition;
            void main(){
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
        `,
            fragmentShader:`
            uniform vec3 start;
            uniform vec3 end;
            uniform vec3 innerColor;
            uniform vec3 outerColor;
            uniform float thickness;
            uniform float time;
            varying vec3 vPosition;
            void main(){
                vec3 direction = normalize(end - start);
                vec3 perpendicular = vec3(-direction.z, 0, direction.x);
                float distance = length(end - start);
                float t = dot(vPosition - start, direction) / distance;
                vec3 projection = start + direction * t;
                float distanceFromLine = length(vPosition - projection);
                float intensity = smoothstep(thickness, 0.0, distanceFromLine);
                vec3 color = mix(innerColor, outerColor, intensity);
                gl_FragColor = vec4(color,1.0);
            }
        `,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false
        });
    }

    /**
     * @method createGeometry - A method that creates a geometry for the lightning bolt.
     * @param deltaTime - The time between frames.
     */
    update(deltaTime){
        this.time += deltaTime;
        this.material.uniforms.time.value = this.time;
    }
}

export {Lightning};
