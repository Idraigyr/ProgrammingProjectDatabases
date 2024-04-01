import {Entity} from "../Entity.js"
import * as THREE from "three";
import {convertWorldToGridPosition} from "../../helpers.js";
import {gridCellSize} from "../../configs/ViewConfigs.js";

/**
 * Base class for the placeable model
 */
export class Placeable extends Entity{
    constructor(params) {
        super(params);
        this.id = null;
        this.level = params?.level ?? 0;
        this.rotation = params?.rotation ??  0;
        this.gems = [];
    }

    setId(data){
        this.id = event.detail.id;
    }

    formatPOSTData(userInfo){
        const gridPos = new THREE.Vector3().copy(this.position);
        convertWorldToGridPosition(this.position);
        const obj = {
            island_id: userInfo.islandID,
            x: gridPos.x/gridCellSize,
            z: gridPos.z/gridCellSize,
            rotation: this.rotation,
            type: this.dbType,
            blueprint: {},
            level: this.level,
            gems: []

        };
        for(const gem of this.gems){
            //obj.gems.push(gem.formatPOSTData(userInfo));
        }
        return obj;
    }

    get type(){
        return "building";
    }

    get dbType(){
        return "placeable";
    }
}