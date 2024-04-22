import * as THREE from 'three';

export class PeerController{
    constructor(params) {
        this.peer = params.peer;
        this.rotation = new THREE.Quaternion();
    }

    update(data){
        this.peer.position = this.peer.position.set(data.position.x, data.position.y, data.position.z);
        this.peer.phi = data.phi; //TODO: maybe change phi and rotation to be updated by the same event (only 1 rotation property in character)
        this.peer.rotation = this.rotation;
        this.peer.fsm.setState(data.state);
    }

}