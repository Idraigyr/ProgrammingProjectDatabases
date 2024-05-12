import * as THREE from "three";
import {IView} from "./View.js";

const vs = 'uniform vec3 viewVector;\n' +
    'uniform float c;\n' +
    'uniform float p;\n' +
    'varying float intensity;\n' +
    'void main() \n' +
    '{\n' +
    '    vec3 vNormal = normalize( normalMatrix * normal );\n' +
    '\tvec3 vNormel = normalize( normalMatrix * viewVector );\n' +
    '\tintensity = pow( c - dot(vNormal, vNormel), p );\n' +
    '\t\n' +
    '    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n' +
    '}';
const fs = 'uniform vec3 glowColor;\n' +
    'varying float intensity;\n' +
    'void main() \n' +
    '{\n' +
    '\tvec3 glow = glowColor * intensity;\n' +
    '    gl_FragColor = vec4( glow, 1.0 );\n' +
    '}';

/**
 * Shield view
 */
export class Shield extends IView{
    constructor(params) {
        super(params);
        this.camera = params.camera;
        this.charModel = new THREE.Group();
        this.centerOffset = params?.centerOffset ?? 1;
        this.heightOffset = params?.heightOffset ?? 0.5;
        this.initTriShield();
    }

    /**
     * @public Initializes the tri shield
     */
    initTriShield(){
        let shield1 = this.#createShieldMesh();
        shield1.rotation.y = 120 * Math.PI/180;
        shield1.translateZ(this.centerOffset);
        shield1.translateY(this.heightOffset);

        let shield2 = this.#createShieldMesh();
        shield2.rotation.y = 240 * Math.PI/180;
        shield2.translateZ(this.centerOffset);
        shield2.translateY(this.heightOffset);

        let shield3 = this.#createShieldMesh();
        shield3.translateZ(this.centerOffset);
        shield3.translateY(this.heightOffset);

        this.charModel.add(shield1);
        this.charModel.add(shield2);
        this.charModel.add(shield3);
    }

    /**
     * @public Initializes the mono shield
     */
    initMonoShield(){
        let shield1 = this.#createShieldMesh();
        shield1.translateY(this.heightOffset);
        this.charModel.add(shield1);
    }

    /**
     * @public Updates the shield's rotation
     * @param deltaTime The time passed since the last update
     */
    update(deltaTime){
        this.charModel.rotateY((Math.PI/180)*deltaTime*20);

        this.charModel.children.forEach((child) => {
            child.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(this.camera.position, child.position);
        });
    }

    /**
     * @private Creates a shield mesh
     * @returns {Mesh} The shield mesh
     */
    #createShieldMesh(){
        let shieldShape = new THREE.Shape();
        shieldShape.moveTo(0,0);
        shieldShape.bezierCurveTo(-3,1,-4,5,-4,8);
        shieldShape.bezierCurveTo(-2,9,0,11,0,11);
        shieldShape.bezierCurveTo(0,11,2,9,4,8);
        shieldShape.bezierCurveTo(4,5,3,1,0,0);
        shieldShape.lineTo(0,0);

        const extrudeSettings = {
            steps: 1,
            depth: 0.2,
            bevelEnabled: true,
            bevelThickness: 0.2,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 1
        };
        const geometry = new THREE.ExtrudeGeometry( shieldShape, extrudeSettings );

        let customMaterial = new THREE.ShaderMaterial(
            {
                uniforms:
                    {
                        "c":   { type: "f", value: 1.0 },
                        "p":   { type: "f", value: 1.4 },
                        glowColor: { type: "c", value: new THREE.Color(0xffff00) },
                        viewVector: { type: "v3", value: this.camera.position }
                    },
                vertexShader:   vs,
                fragmentShader: fs,
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                transparent: true
            }   );
        const shield = new THREE.Mesh(geometry, customMaterial);
        shield.scale.multiplyScalar(0.2);
        return shield;
    }
    loseShield(event){
        this.charModel.children[event.detail.shields].material.uniforms.glowColor.value = new THREE.Color(0xff0000);
    }
}