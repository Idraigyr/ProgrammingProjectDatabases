import {MeshBVH, MeshBVHHelper, StaticGeometryGenerator} from "three-mesh-bvh";
// import { GenerateMeshBVHWorker } from "three-MeshBVHWorker";
import * as THREE from "three";
import {min} from "../helpers.js";
export class CollisionDetector{
    constructor(params) {
        this.scene = params.scene;
        this.charModel = [];
        this.collider = null;
        this.visualizer = null;
        // this.worker = new GenerateMeshBVHWorker();
        this.viewManager = params.viewManager;

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

    fillModelGroup(){
        this.charModel = this.viewManager.colliderModels;
    }

    generateCollider(){
        this.fillModelGroup();
        let staticGenerator = new StaticGeometryGenerator(this.charModel);
        staticGenerator.attributes = [ 'position' ];

        let mergedGeometry = staticGenerator.generate();
        mergedGeometry.boundsTree = new MeshBVH( mergedGeometry );
        this.collider = new THREE.Mesh(mergedGeometry);

        // this.waitingOnWorker = true;
        // this.worker.generate(mergedGeometry).then(bvh => {
        //     mergedGeometry.boundsTree = bvh;
        //     this.collider = new THREE.Mesh(mergedGeometry);
        // }).reject().finally(() => this.waitingOnWorker = false);
    }

    isBoxCollision(boundingBox){
        return this.collider.geometry.boundsTree.intersectsBox(boundingBox);
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

                }

            }

        } );

        const newPosition = this.tempVector;
        newPosition.copy( playerModel.segment.end );
        newPosition.y -= playerModel.radius;

        const deltaVector = this.tempVector2;
        deltaVector.subVectors( newPosition, position );

        playerModel.onGround = deltaVector.y > Math.abs( deltaTime * playerModel.velocity.y * 0.25);

        const offset = Math.max( 0.0, deltaVector.length() - 1e-5 );
        deltaVector.normalize().multiplyScalar( offset );

        position.add( deltaVector );

        return deltaVector;
    }

    checkSpellCollisions(){

    }
}