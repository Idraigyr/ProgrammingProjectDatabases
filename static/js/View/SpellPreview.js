import {IView} from "./View.js";
import * as THREE from "three";

/**
 * Spell preview object
 */
export class SpellPreview extends IView{
    #gridCellSize;
    #cutoff;
    constructor(params) {
        super(params);
        this.types = {};
        this.visible = true; //TODO: set to false and change to true when buildspell is equipped in current spellslot (always spellslot 1 in hud/itemManager === index 0 in wizard.spells)

        for(let i = 0; i < params.length; i++){
            this.types[params[i].key] = params[i].details;
        }
        this.rotate = this.types[Object.keys(this.types)[0]].rotate;
        this.horizontalRotation = this.types[Object.keys(this.types)[0]]?.horizontalRotation ?? 0;
        this.currentType = params[0].key;
        this.material = this.createMaterial(
            this.types[Object.keys(this.types)[0]].primaryColor,
            this.types[Object.keys(this.types)[0]].secondaryColor,
            this.types[Object.keys(this.types)[0]].cutoff);
        this.charModel = new THREE.Mesh(new this.types[Object.keys(this.types)[0]].ctor(...this.types[Object.keys(this.types)[0]].params), this.material);
        this.boxHelper.visible = false;
        this.#gridCellSize = 10;
        this.#cutoff = this.types[Object.keys(this.types)[0]].cutoff;
        this.updating = false;
    }

    addType(key, type){
        this.types[key] = type;
    }

    /**
     * Update position of the preview object
     * @param event event with position
     */
    updateRotation(event) {
        if(!this.rotate) return;
        return super.updateRotation(event);
    }

    /**
     * Render the preview object
     * @param event event with position and rotation
     */
    render(event){
        if(event.detail.name !== this.currentType) this.setModel(event.detail.name);
        this.charModel.visible = this.visible;

        this.updatePosition(event);
        event.detail.rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), event.detail.rotation ?? 0);
        super.updateRotation(event);
        //TODO: remove magic value
        this.charModel.translateY(1.5);
    }

    /**
     * Make the preview object (in)visible
     * @param event event with visibility
     */
    toggleVisibility(event){
        this.visible = event.detail.visible;
    }

    /**
     * Set model of the preview object
     * @param key key of the model
     */
    setModel(key){
        this.charModel.geometry = new this.types[key].ctor(...this.types[key].params);
        this.charModel.material.uniforms.primaryColor.value.set(this.types[key].primaryColor);
        this.charModel.material.uniforms.secondaryColor.value.set(this.types[key].secondaryColor);
        this.charModel.material.uniforms.cutoff.value = this.types[key].cutoff;
        this.rotate = this.types[key].rotate;
        this.horizontalRotation = this.types[key]?.horizontalRotation ?? 0;
        // super.updateRotation({detail: {rotation: new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), this.horizontalRotation * Math.PI / 180)}});
        this.currentType = key;
    }

    /**
     * Update position of the preview object
     * @param deltaTime
     * @param camera
     */
    update(deltaTime, camera) {
        this.charModel.material.uniforms.time.value += deltaTime*2;
    }

    /**
     * Create material for the preview object
     * @param primaryColor primary color
     * @param secondaryColor secondary color
     * @param cutoff cutoff value
     * @returns {ShaderMaterial} material for the preview object
     */
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