import * as THREE from 'three';

export class PeerController{
    constructor(params) {
        this.peer = params.peer;
        this.rotation = new THREE.Quaternion();
    }

    /**
     * updates state of peer. will be used for 3 seperate stateUpdate events: 1) for state change 2) for position and rotation change 3) for health change
     * @param data
     */
    update(data){
        if(!this.peer) return;
        if(data.state){
            this.peer.fsm.setState(data.state);
            return;
        }
        this.peer.position = this.peer.position.set(data.position.x, data.position.y, data.position.z);
        this.peer.phi = data.phi; //TODO: maybe change phi and rotation to be updated by the same event (only 1 rotation property in character)
        this.peer.rotation = this.rotation;
    }

}