import * as THREE from "three";

export class Cursor {
    charModel = null;
    /**
     * Constructor for AxisHelper
     * @param {{length: number, offset: number, axisCursor: boolean}} params of the axis
     */
    constructor(params){
        this.axisLength = params?.length ?? 1;
        this.offset = params?.offset ?? 3;
        this.axisCursor = params?.axisCursor ?? true;
        if(this.axisCursor){
            this.charModel = this.initAxes();
        } else {
            this.charModel = new THREE.Mesh(
                new THREE.SphereGeometry(0.1),
                new THREE.MeshPhongMaterial({color: 0xFF6C00 })
            );
        }
    }

    initAxes(){
        const group = new THREE.Group();
        const x = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(
                [
                    new THREE.Vector3( 0, 0, 0 ),
                    new THREE.Vector3( this.axisLength, 0, 0 )
                ] ),
            new THREE.LineBasicMaterial( { color: 0xff0000 } ) );

        const y = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(
                [
                    new THREE.Vector3( 0, 0, 0 ),
                    new THREE.Vector3( 0, this.axisLength, 0 )
                ] ),
            new THREE.LineBasicMaterial( { color: 0x00ff00 } ) );
        const z = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(
                [
                    new THREE.Vector3( 0, 0, 0 ),
                    new THREE.Vector3( 0, 0, this.axisLength )
                ] ),
            new THREE.LineBasicMaterial( { color: 0x0000ff } ) );

        group.add(x);
        group.add(y);
        group.add(z);
        return group;
    }

    updatePosition(position){
        this.charModel.position.copy(position);
    }

    updateRotation(rotation){
        if(this.axisCursor) return;
        this.charModel.setRotationFromQuaternion(rotation);
    }
}