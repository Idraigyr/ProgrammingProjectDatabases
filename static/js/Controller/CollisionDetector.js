import {MeshBVH, MeshBVHHelper, StaticGeometryGenerator} from "three-mesh-bvh";
import {mergeVertices} from "three-BufferGeometryUtils";
import * as THREE from "three";
import {workerURI} from "../configs/EndpointConfigs.js";
import {Subject} from "../Patterns/Subject.js";
export class CollisionDetector extends Subject{
    constructor(params) {
        super(params);
        this.startUp = true;
        this.scene = params.scene;
        this.charModel = [];
        this.collider = null;
        this.visualizer = null;
        this.viewManager = params.viewManager;

        this.worker = null;
        this.loader = new THREE.BufferGeometryLoader();
        this.mergedGeometry = new THREE.BufferGeometry();

        //only use = not needing to allocate extra memory for new vectors
        this.tempVector = new THREE.Vector3();
        this.tempVector2 = new THREE.Vector3();

        this.tempBox = new THREE.Box3();
    }

    visualize(params = {collisionMesh: false, bvh: false, bvhDepth: 10}){
        if(params.collisionMesh){
            this.collider.material.wireframe = true;
            this.collider.material.opacity = 0.5;
            this.collider.material.transparent = true;
            this.collider.visible = true;
            this.scene.add( this.collider );
        } else {
            try {
                this.scene.remove(this.collider);
            } catch (e){
                console.log("Collider not added to scene.");
            }
        }
        if(params.bvh){
            this.visualizer = new MeshBVHHelper( this.collider, params.bvhDepth );
            this.visualizer.visible = true;
            this.scene.add( this.visualizer );
        } else {
            try {
                this.scene.remove(this.visualizer);
            } catch (e){
                console.log("Visualiser not added to scene.");
            }
        }
    }

    stringifyCharModel(){
        const json = [];
        for(const index in this.charModel){
            json.push(this.charModel[index].toJSON());
        }
        return JSON.stringify(json);
    }

    parseColliderWorkerJSON(json){
        json = JSON.parse(json);
        //this.collider = new THREE.Mesh(mergeVertices(this.loader.parse(json.geometry)));
        this.collider = new THREE.Mesh(this.loader.parse(json.geometry));
        this.collider.geometry.boundsTree = MeshBVH.deserialize(json.boundsTree, this.collider.geometry, {setIndex: true});
    }

    generateCollider(){
        this.viewManager.getColliderModels(this.charModel);
        let staticGenerator = new StaticGeometryGenerator(this.charModel);
        staticGenerator.attributes = [ 'position' ];

        this.mergedGeometry = staticGenerator.generate();

        this.mergedGeometry.boundsTree = new MeshBVH( this.mergedGeometry );
        return new THREE.Mesh(this.mergedGeometry);
    }

    generateColliderOnWorker(){
        if(typeof Worker === 'undefined' || this.startUp || true){
            //show loading screen
            document.getElementById('progress-bar').labels[0].innerText = "Letting Fairies prettify the building...";
            document.querySelector('.loading-animation').style.display = 'visible';
            this.collider = this.generateCollider();
            document.querySelector('.loading-animation').style.display = 'none';
        } else {
            console.log("starting worker...");

            this.worker = new Worker(workerURI, {type: 'module'});
            console.log(this.worker);
            this.worker.addEventListener('message', this.receiveCollider.bind(this));
            this.worker.postMessage(this.stringifyCharModel());
        }
        this.startUp = false;
    }

    receiveCollider(msg){
        this.parseColliderWorkerJSON(msg.data);
        this.dispatchEvent(this.createColliderReadyEvent());
    }

    BoxCollisionWithWorld(boundingBox){
        return this.collider.geometry.boundsTree.intersectsBox(boundingBox, new THREE.Matrix4());
    }

    boxToBoxCollision(box1, box2, ){
        return box1.intersectsBox(box2);
    }

    checkSpellEntityCollisions(deltaTime){
        //TODO: what if spell "phases" through collision because of high velocity/deltaTime?
        for(const spellEntity of this.viewManager.pairs.spellEntity){
            if(this.BoxCollisionWithWorld(spellEntity.view.boundingBox)){
                spellEntity.model.onWorldCollision(deltaTime);
            }
            this.viewManager.pairs.player.forEach((player) => {
                if(this.boxToBoxCollision(spellEntity.view.boundingBox, player.view.boundingBox)){
                    spellEntity.model.onCharacterCollision(deltaTime, player.model,spellEntity.view.boundingBox, player.view.boundingBox);
                }
            });
        }
    }



    adjustPlayerPosition(playerModel, position, deltaTime){
        playerModel.setSegmentFromPosition(position);

        this.tempBox.makeEmpty();

        this.tempBox.expandByPoint( playerModel.segment.start );
        this.tempBox.expandByPoint( playerModel.segment.end );

        this.tempBox.min.addScalar( - playerModel.radius );
        this.tempBox.max.addScalar( playerModel.radius );


        this.collider.geometry.boundsTree.shapecast( {

            intersectsBounds: box => box.intersectsBox( this.tempBox ),

            intersectsTriangle: tri => {

                // check if the triangle is intersecting the capsule and adjust the
                // capsule position if it is.
                const triPoint = this.tempVector;
                const capsulePoint = this.tempVector2;

                const distance = tri.closestPointToSegment( playerModel.segment, triPoint, capsulePoint );
                if ( distance < playerModel.radius) {

                    const depth = playerModel.radius - distance;
                    const direction = capsulePoint.sub( triPoint ).normalize();

                    playerModel.segment.start.addScaledVector( direction, depth );
                    playerModel.segment.end.addScaledVector( direction, depth );
                    return false;
                }
            }

        } );

        const newPosition = this.tempVector;
        newPosition.copy( playerModel.segment.end );
        newPosition.y -= playerModel.radius;

        const deltaVector = this.tempVector2;
        deltaVector.subVectors( newPosition, position );

        playerModel.onGround = playerModel.onCollidable || deltaVector.y > Math.abs( deltaTime * playerModel.velocity.y * 0.25);
        //console.log(playerModel.onGround)
        playerModel.onCollidable = false;

        const offset = Math.max( 0.0, deltaVector.length() - 1e-5 );
        deltaVector.normalize().multiplyScalar( offset );

        position.add( deltaVector );

        return deltaVector;
    }

    checkSpellCollisions(){

    }

    createColliderReadyEvent() {
        console.log("Collider ready event.");
        return new CustomEvent('colliderReady');
    }
}