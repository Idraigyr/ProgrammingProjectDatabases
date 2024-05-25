import {MeshBVH, MeshBVHHelper, StaticGeometryGenerator} from "three-mesh-bvh";
import {mergeVertices} from "three-BufferGeometryUtils";
import * as THREE from "three";
import {workerURI} from "../configs/EndpointConfigs.js";
import {Subject} from "../Patterns/Subject.js";
export class CollisionDetector extends Subject{
    /**
     * Constructor for the collision detector
     * @param {{scene: THREE.Scene, viewManager: ViewManager, raycastController: RaycastController | undefined}} params
     */
    constructor(params) {
        super(params);
        this.startUp = true;
        this.scene = params.scene;
        this.charModel = [];
        this.collider = null;
        this.visualizer = null;
        this.viewManager = params.viewManager;

        //for preventing phasing through ground
        this.pointBelow = null;
        this.raycastController = params?.raycastController ?? null;

        this.worker = null;
        this.loader = new THREE.BufferGeometryLoader();
        this.mergedGeometry = new THREE.BufferGeometry();

        //only use = not needing to allocate extra memory for new vectors
        this.tempVector = new THREE.Vector3();
        this.tempVector2 = new THREE.Vector3();

        this.tempBox = new THREE.Box3();
    }

    /**
     * sets the raycastController
     * @param raycastController
     */
    setRaycastController(raycastController){
        this.raycastController = raycastController;
    }

    /**
     * visualizes the BVH or the collision mesh
     * @param params
     */
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
            this.visualizer = new MeshBVHHelper( this.collider, params?.bvhDepth ?? 10);
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

    /**
     * converts a Object3D to a JSON string
     * @return {string}
     */
    stringifyCharModel(){
        const json = [];
        for(const index in this.charModel){
            json.push(this.charModel[index].toJSON());
        }
        return JSON.stringify(json);
    }

    /**
     * parses a JSON string representation of the static geometry + BVH to a Object3D
     * @param json
     */
    parseColliderWorkerJSON(json){
        json = JSON.parse(json);
        //this.collider = new THREE.Mesh(mergeVertices(this.loader.parse(json.geometry)));
        this.collider = new THREE.Mesh(this.loader.parse(json.geometry));
        this.collider.geometry.boundsTree = MeshBVH.deserialize(json.boundsTree, this.collider.geometry, {setIndex: true});
    }

    /**
     * generates a collider mesh from the building and island charModels in the viewManager
     * @return {THREE.Mesh}
     */
    generateCollider(){
        this.viewManager.getColliderModels(this.charModel);
        let staticGenerator = new StaticGeometryGenerator(this.charModel);
        staticGenerator.attributes = [ 'position' ];

        this.mergedGeometry = staticGenerator.generate();

        this.mergedGeometry.boundsTree = new MeshBVH( this.mergedGeometry );
        return new THREE.Mesh(this.mergedGeometry);
    }

    /**
     * generates a collider mesh from the building and island charModels in the viewManager on a webWorker if supported, currently just calls generateCollider
     */
    generateColliderOnWorker(){
        if(typeof Worker === 'undefined' || this.startUp || true){
            //show loading screen
            document.getElementById('progress-bar').labels[0].innerText = "Letting Fairies prettify the building...";
            document.querySelector('.loading-animation').style.display = 'block';
            this.collider = this.generateCollider();
            document.querySelector('.loading-animation').style.display = 'none';
        } else {
            console.log("starting worker...");

            this.worker = new Worker(workerURI, {type: 'module'});
            console.log(this.worker);
            this.worker.addEventListener('message', this.receiveCollider.bind(this));
            this.viewManager.getColliderModels(this.charModel);
            this.worker.postMessage(this.stringifyCharModel());
        }
        this.startUp = false;
    }

    /**
     * receives the collider mesh from the worker and parses it
     * @param msg
     */
    receiveCollider(msg){
        this.parseColliderWorkerJSON(msg.data);
        this.dispatchEvent(this.createColliderReadyEvent());
    }

    /**
     * checks if a bounding box collides with the static geometry (=world)
     * @param {THREE.Box3} boundingBox
     * @return {boolean}
     * @constructor
     */
    BoxCollisionWithWorld(boundingBox){
        return this.collider.geometry.boundsTree.intersectsBox(boundingBox, new THREE.Matrix4());
    }

    /**
     * checks if two bounding boxes collide
     * @param {THREE.Box3} box1
     * @param {THREE.Box3} box2
     * @return {*}
     */
    boxToBoxCollision(box1, box2){
        return box1.intersectsBox(box2);
    }

    /**
     * checks if a spellEntity collides with anything
     * @param {number} deltaTime
     */
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
            this.viewManager.pairs.proxy.forEach((proxy) => {
                if(this.boxToBoxCollision(spellEntity.view.boundingBox, proxy.view.boundingBox)){
                    spellEntity.model.onCharacterCollision(deltaTime, proxy.model,spellEntity.view.boundingBox, proxy.view.boundingBox);
                }

            });
            this.viewManager.pairs.character.forEach((character) => {
                if(this.boxToBoxCollision(spellEntity.view.boundingBox, character.view.boundingBox)){
                    spellEntity.model.onCharacterCollision(deltaTime, character.model, spellEntity.view.boundingBox, character.view.boundingBox);
                }
            });
            this.viewManager.pairs.spellEntity.forEach((spell) => {
                if(this.boxToBoxCollision(spellEntity.view.boundingBox, spell.view.boundingBox)){
                    spellEntity.model.onCharacterCollision(deltaTime, spell.model, spellEntity.view.boundingBox, spell.view.boundingBox);
                }
            });

            //TODO: check for collision with other spellEntities (mainly collidables like icewall)
        }
    }

    /**
     * checks if a character collides with anything
     * @param {number} deltaTime
     */
    checkCharacterCollisions(deltaTime){
        for(const character of this.viewManager.pairs.character){
            this.viewManager.pairs.player.forEach((player) => {
                if(this.boxToBoxCollision(character.view.boundingBox, player.view.boundingBox)){
                    character.model.onCharacterCollision(deltaTime, player.model, character.view.boundingBox, player.view.boundingBox);
                }
            });
        }
    }

    /**
     * gets all characters within distance of a character
     * @param {Character} character
     * @param {number} distance
     * @return {Character[]}
     */
    getCharactersCloseToCharacter(character, distance){
        let closeCharacters = [];
        const algo = (otherCharacter) => {
            if(character.position.distanceTo(otherCharacter.model.position) < distance){
                closeCharacters.push(otherCharacter);
            }
        }
        this.viewManager.pairs.character.forEach(algo);
        this.viewManager.pairs.player.forEach(algo);
        return closeCharacters;
    }

    /**
     * gets the closest enemy to a character
     * @param {Character} character
     * @param {string[]} targets - which types of entities to consider, default is players and characters, order is important (put the targets with the highest priority at the end)
     * possible targets: "player", "character", "proxy", "spellEntity"
     * @return {{closestEnemy: Object, closestDistance: number}} - closestEnemy type depends on the target array
     */
    getClosestEnemy(character, targets = ["player", "character"]){
        //TODO: maybe add something so you can differentiate targets within the "proxy" group (i.e. different buildings can have different priorities)?
        let closestEnemy = null;
        let closestDistance = Infinity;
        const algo = (otherCharacter) => {
            if(character.team !== otherCharacter.model.team && otherCharacter.model.targettable){
                let distance = character.position.distanceTo(otherCharacter.model.position);
                if(distance < closestDistance){
                    closestDistance = distance;
                    closestEnemy = otherCharacter.model;
                }
            }
        }
        //order of target array is important!
        targets.forEach((target) => {
            this.viewManager.pairs[target].forEach(algo);
        });
        return {closestEnemy, closestDistance};
    }

    /**
     * checks if a player collides with static geometry and adjusts the player position accordingly
     * @param {Character} character
     * @param {THREE.Vector3} position
     * @param {number} deltaTime
     * @return {THREE.Vector3}
     */
    adjustCharacterPosition(character, position, deltaTime){
        //fix for falling through ground
        if(this.raycastController) this.pointBelow = this.raycastController.getFirstHitWithWorld(character.segment.start, new THREE.Vector3(0,-1,0))[0]?.point ?? null;

        character.setSegmentFromPosition(position);

        // create a box around the capsule to check for collisions
        this.tempBox.makeEmpty();
        this.tempBox.expandByPoint( character.segment.start );
        this.tempBox.expandByPoint( character.segment.end );
        this.tempBox.min.addScalar( - character.radius );
        this.tempBox.max.addScalar( character.radius );

        // check for collisions with the static geometry bvh tree
        this.collider.geometry.boundsTree.shapecast( {
            // check if the box intersects the bounds of the BVH nodes
            intersectsBounds: box => box.intersectsBox( this.tempBox ),
            //check what triangles intersect with the character
            intersectsTriangle: tri => {

                // check if the triangle is intersecting the capsule and adjust the
                // capsule position if it is.
                const triPoint = this.tempVector;
                const capsulePoint = this.tempVector2;

                const distance = tri.closestPointToSegment( character.segment, triPoint, capsulePoint );
                if ( distance < character.radius) {

                    const depth = character.radius - distance;
                    const direction = capsulePoint.sub( triPoint ).normalize();

                    //if character is clipping through the ground, move it up
                    character.segment.start.addScaledVector( direction, depth );
                    character.segment.end.addScaledVector( direction, depth );

                    // solution for clipping through ground and getting stuck (if triangle within player just move player up)
                    this.tempVector2.y = triPoint.y - character.segment.end.y;

                    if(character.segment.end.y < triPoint.y && character.segment.start.y > triPoint.y){
                        character.segment.start.add(new THREE.Vector3(0, this.tempVector2.y, 0));
                        character.segment.end.add(new THREE.Vector3(0, this.tempVector2.y, 0));
                    }

                    return false;
                }
            }

        } );

        //fix for falling through ground
        if(this.raycastController && this.pointBelow?.y > character.segment.end.y){
            const distance = this.pointBelow.y - character.segment.end.y;
            character.segment.start.y += distance;
            character.segment.end.y += distance;
        }

        const newPosition = this.tempVector;
        newPosition.copy( character.segment.end );
        newPosition.y -= character.radius;

        const deltaVector = this.tempVector2;
        deltaVector.subVectors( newPosition, position );

        character.onGround = character.onCollidable || deltaVector.y > Math.abs( deltaTime * character.velocity.y * 0.25);
        //console.log(playerModel.onGround)
        character.onCollidable = false;

        const offset = Math.max( 0.0, deltaVector.length() - 1e-5 );
        deltaVector.normalize().multiplyScalar( offset );

        position.add( deltaVector );

        return deltaVector;
    }

    /**
     * NYI
     */
    checkSpellCollisions(){

    }

    /**
     * creates a custom event notifying the collider is ready
     * @return {CustomEvent<>}
     */
    createColliderReadyEvent() {
        console.log("Collider ready event.");
        return new CustomEvent('colliderReady');
    }
}