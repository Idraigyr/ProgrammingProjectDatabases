import {IView} from "./View.js";
import * as THREE from "three";

 const _VS = `
varying vec2 vUV;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vUV = uv;
}
`;

  const _PS = `
uniform vec3 colour;
uniform float health;

varying vec2 vUV;

void main() {
  gl_FragColor = vec4(mix(colour, vec3(0.0), step(health, vUV.y)), 1.0);
}
`;


/**
 * Proxy view base class
 */
export class ProxyView extends IView{
    constructor(params) {
        super(params);
        this.hasUpdates = true;
        this.healthBar = null;
        this.iniHealthBar();

    }

    /**
     * Clean up the view for disposal
     */
    dispose() {
        try {
            this.boxHelper.parent.remove(this.boxHelper);
        } catch (err){
            // console.log("BoxHelper not added to scene.");
        }
        this.healthBar.parent.remove(this.healthBar);
    }



    /**
     * Initialize Buildings's health bar
     */
    iniHealthBar() {
        const uniforms = {
            colour: {
                value: new THREE.Color(0, 1, 0),
            },
            health: {
                value: 1.0,
            },
        };
        this.material_ = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: _VS,
            fragmentShader: _PS,
            blending: THREE.NormalBlending,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            side: THREE.DoubleSide,
        });

        this.geometry_ = new THREE.BufferGeometry();

        this.healthBar = new THREE.Mesh(this.geometry_, this.material_);
        this.healthBar.frustumCulled = false;
        this.healthBar.scale.set(2, 0.125, 1);

        this.realHealth_ = 1.0;
        this.animHealth_ = 1.0;


        this.GenerateBuffers_();

    }

    OnHealth_(event) {
        this.realHealth_ = (event.detail.current / event.detail.total);
    }
    update(deltaTime, camera) {
        const t = 1.0 - Math.pow(0.001, deltaTime);

        this.animHealth_ = t * (this.realHealth_ - this.animHealth_) + this.animHealth_;

        const _R = new THREE.Color(1.0, 0, 0);
        const _G = new THREE.Color(0.0, 1.0, 0.0);
        const c = _R.clone();
        c.lerpHSL(_G, this.animHealth_);

        this.material_.uniforms.health.value = this.animHealth_;
        this.material_.uniforms.colour.value = c;
        this.healthBar.position.copy(this.position);
        //TODO: adjust if needed, maybe do it with a variabele based on the type of building?
        this.healthBar.position.y += 10;
        this.healthBar.quaternion.copy(camera.quaternion);
    }


    GenerateBuffers_() {
        const indices = [];
        const positions = [];
        const uvs = [];

        const square = [0, 1, 2, 2, 3, 0];

        indices.push(...square);

        const p1 = new THREE.Vector3(-1, -1, 0);
        const p2 = new THREE.Vector3(-1, 1, 0);
        const p3 = new THREE.Vector3(1, 1, 0);
        const p4 = new THREE.Vector3(1, -1, 0);

        uvs.push(0.0, 0.0);
        uvs.push(1.0, 0.0);
        uvs.push(1.0, 1.0);
        uvs.push(0.0, 1.0);

        positions.push(p1.x, p1.y, p1.z);
        positions.push(p2.x, p2.y, p2.z);
        positions.push(p3.x, p3.y, p3.z);
        positions.push(p4.x, p4.y, p4.z);

        this.geometry_.setAttribute(
            'position', new THREE.Float32BufferAttribute(positions, 3));
        this.geometry_.setAttribute(
            'uv', new THREE.Float32BufferAttribute(uvs, 2));
        this.geometry_.setIndex(
            new THREE.BufferAttribute(new Uint32Array(indices), 1));

        this.geometry_.attributes.position.needsUpdate = true;
      }
}