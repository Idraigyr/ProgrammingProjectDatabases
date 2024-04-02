import {IAnimatedView, IView} from "./View.js";
import * as THREE from "three";
import {ParticleSystem} from "./ParticleSystem.js";
import {Color} from "three";

/**
 * Fireball view
 */
export class Fireball extends IView{
    constructor(params) {
        super(params);
        this.particleSystem = new ParticleSystem(params);

        const geo = new THREE.SphereGeometry(0.1);
        const mat = new THREE.MeshPhongMaterial({color: 0xFF6C00 });
        this.charModel = new THREE.Mesh(geo, mat);
    }

    cleanUp(){
        this.charModel.parent.remove(this.charModel);
        this.particleSystem.cleanUp();
    }
    update(deltaTime){
        this.particleSystem.update(deltaTime);
    }

    /**
     * Update fireball position
     * @param event event with position
     */
    updatePosition(event){
        if(!this.charModel) return;
        this.charModel.position.copy(event.detail.position);
        this.particleSystem.position.copy(event.detail.position);
    }
}

export class ThunderCloud extends IView{
    constructor(params) {
        super(params);
        this.camera = params.camera;
        this.opacity = params?.opacity ?? 0.8;
        this.speed = params?.speed ?? 0.4;
        this.width  = params?.width ?? 8;
        this.height = params?.height ?? 1;
        this.NrPlanes = params?.NrPlanes ?? 40;
        this.scale = params?.scale ?? 0.3;
        this.texture = params.texture;
        this.color = params?.color ?? '#999999';
        this.planesRotation = [];

        this.timer = 0;
        this.durationTimer = 0;
        this.interval = 0;
        this.duration = Math.random()*2;
        this.lightOn = false;

        this.cloudMetrics = this.#generateCloudMetrics();
        this.light = this.#createPointLight();
        this.planes = this.#createCloud(this.color, this.opacity);
        this.charModel = new THREE.Group();
        this.charModel.add(this.light);
        this.charModel.add(this.planes);
    }
    #generateCloudMetrics(){
        return [...new Array(this.NrPlanes)].map((_, index) => ({
            x: (this.width / 2 - Math.random() * this.width) + this.position.x,
            y: (this.height /2 - Math.random() * this.height) + this.position.y,
            z: (this.width / 2 - Math.random() * this.width) + this.position.z,
            scale: this.scale + Math.sin(((index + 1) / this.NrPlanes) * Math.PI) * ((this.scale/2 + Math.random()) * 10),
            density: Math.max(0.2, Math.random()),
            rotation: Math.max(0.002, 0.005 * Math.random()) * this.speed,
        }));
    }

    #rotateAroundPosition(obj, axis, angle){
        obj.position.sub(this.position);
        obj.position.applyAxisAngle(axis, angle);
        obj.position.add(this.position);
    }
    #createPlane(color, scale, density, opacity){
        let geo = new THREE.PlaneGeometry(0.2*scale,0.2*scale);
        let mat = new THREE.MeshStandardMaterial({map: this.texture, color: color, blending: THREE.NormalBlending, depthWrite: false, transparent: true, depthTest: true, opacity: (scale / 6) * density * opacity});
        return new THREE.Mesh(geo, mat);
    }

    #createPointLight(){
        const light = new THREE.PointLight( 0x7777FF, 0);
        light.position.copy(this.position);
        light.position.x += this.width/4;
        light.castShadow = true;
        return light;
    }

    #createCloud(color,opacity){
        let group = new THREE.Group();
        this.cloudMetrics.forEach((segment, index) => {
            group.add(this.#createPlane(color,segment.scale,segment.density,opacity));
            group.children[index].position.set(segment.x, segment.y, segment.z);
            group.children[index].lookAt(this.camera.position);
            this.planesRotation.push(group.children[index].rotation.z);
        })
        return group;
    }

    #updateLight(deltaTime){
        this.timer += deltaTime;
        if(this.lightOn){
            this.#rotateAroundPosition(this.light,new THREE.Vector3(0,1,0),-0.5*deltaTime);
            this.durationTimer += deltaTime;
            this.light.intensity = Math.random()*1000;
            if(this.durationTimer > this.duration){
                this.duration = Math.random()*2;
                this.durationTimer = 0;
                this.light.intensity = 0;
                //this.lightOn = false;
            }
        }
        if(this.timer > this.interval){
            this.interval = Math.random()*2;
            this.timer = 0;
            this.lightOn = true;
        }
    }

    #updateClouds(deltaTime){
        for(let i = 0; i < this.planes.children.length; i++){
            this.#rotateAroundPosition(this.planes.children[i],new THREE.Vector3(0,1,0),0.2*deltaTime);
            this.planes.children[i].lookAt(this.camera.position);
            this.planesRotation[i] +=  this.cloudMetrics[i].rotation;
            this.planes.children[i].rotation.z = this.planesRotation[i];
            this.planes.children[i].scale.setScalar(this.cloudMetrics[i].scale + (((1 + Math.sin(deltaTime / 10)) / 2) * i) / 10);
        }
    }

    update(deltaTime){
        this.#updateLight(deltaTime);
        this.#updateClouds(deltaTime);
    }

    cleanUp(){
        this.charModel.parent.remove(this.charModel);
    }
}


export class RitualSpell extends IAnimatedView{
    constructor(params) {
        super(params);
        this.camera = params.camera;
        this.charModel = params.charModel;
        this.position = params.position;
    }

    /**
     * Load build ritual model's animations
     * @param clips
     */
    loadAnimations(clips){
        const getAnimation =  (animName, alias) => {
            let clip = THREE.AnimationClip.findByName(clips, animName);
            this.animations[alias] =  new THREE.AnimationAction(this.mixer, clip, this.charModel);
        }
        getAnimation('Scene',"RitualSpell");
    }
    update(deltaTime) {
        super.update(deltaTime);
        this.animations["RitualSpell"].play();
    }
}

//charModel must be a group of iceBlock models
export class IceWall extends IView{
    constructor(params) {
        super(params);
        this.width = params.width;
        this.charModel = params.charModel;
        this.spreadWall();
        this.charModel.position.copy(params.position);
    }
    spreadWall(){
        const length = this.charModel.children.length;
        console.log(this.charModel.children[0])
        for(let i = 0; i < length; i++){
            this.charModel.children[i].position.set(i*this.width/length - this.width/2,0,0);
            this.charModel.children[i].traverseVisible((child) => {
                if (child.isMesh) child.material.opacity = Math.random() * 0.3 + 0.6;
            });
        }
    }

    cleanUp(){
        this.charModel.parent.remove(this.charModel);
    }
}