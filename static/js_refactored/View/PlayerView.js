export class Player{
    constructor() {
        this.charModel = null;
        this.mixer = null;
        this.animations = null;
    }
    updatePosition(event){
        if(!this.charModel) return;
        console.log(event);
        this.charModel.position.set(event.detail.position.x, event.detail.position.y,event.detail.position.z);
    }

    updateRotation(event){
        console.log(this.charModel);
        if(!this.charModel) return;
        console.log(event);
        this.charModel.rotation.setFromQuaternion(event.detail.rotation);
    }

}