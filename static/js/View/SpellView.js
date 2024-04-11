import {IAnimatedView, IView} from "./View.js";
import * as THREE from "three";
import {ParticleSystem} from "./ParticleSystem.js";
import {Color} from "three";
import {iceWall} from "../configs/SpellConfigs.js";

/**
 * Fireball view
 */
export class Fireball extends IView{
    constructor(params) {
        super(params);
        this.particleSystem = new ParticleSystem(params);
        this.staysAlive = true;

        const geo = new THREE.SphereGeometry(0.1);
        const mat = new THREE.MeshPhongMaterial({color: 0xFF6C00 });
        this.charModel = new THREE.Mesh(geo, mat);
        this.boundingBox.setFromObject(this.charModel);
        this.boundingBox.translate(this.position);
    }

    cleanUp(){
        super.cleanUp();
    }
    update(deltaTime){
        this.particleSystem.update(deltaTime);
    }

    isNotDead(deltaTime){
        return this.particleSystem.isNotDead(deltaTime);
    }

    /**
     * Update fireball position
     * @param event event with position
     */
    updatePosition(event){
        if(!this.charModel) return;
        this.delta = new THREE.Vector3().subVectors(event.detail.position, this.position);
        this.boundingBox.translate(this.delta);
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
        this.boundingBox.setFromCenterAndSize(new THREE.Vector3(), new THREE.Vector3(this.width, this.height, this.width));
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
//make iceWall a compound of iceBlock models because of AABB
export const IceWall = function (params) {
    const iceBlocks = [];
    for(let i = 0; i < iceWall.blocks; i++){
        const modelWidth = new THREE.Box3().setFromObject(params.charModel).getSize(new THREE.Vector3()).z;
        iceBlocks.push(new IceBlock({
            charModel: params.charModel.clone(),
            horizontalRotation: params.horizontalRotation,
            //figure out why + 0.5 is needed
            position: new THREE.Vector3(i*(iceWall.width/iceWall.blocks) - (iceWall.width - modelWidth + 0.5)/2,0,0).applyAxisAngle(new THREE.Vector3(0,1,0),params.horizontalRotation*Math.PI/180),
            offset: new THREE.Vector3().copy(params.position)
        }));
        iceBlocks[i].charModel.traverseVisible((child) => {
            if (child.isMesh) child.material.opacity = Math.random() * 0.3 + 0.6;
        });
    }
    return iceBlocks;
}

class IceBlock extends IView{
    constructor(params) {
        super(params);
        this.spawnPoint = new THREE.Vector3().copy(params.position);
        this.offset = params.offset;
        this.boundingBox.setFromObject(this.charModel);
        this.updateRotation({detail: {rotation: new THREE.Quaternion()}});
    }
    updatePosition(event){
        if(!this.charModel) return;
        const newPos = new THREE.Vector3().copy(this.spawnPoint).add(event.detail.position);
        const delta = new THREE.Vector3().subVectors(newPos, this.position);
        this.position.copy(newPos);
        this.charModel.position.copy(this.position);
        this.boundingBox.translate(delta);
    }
}