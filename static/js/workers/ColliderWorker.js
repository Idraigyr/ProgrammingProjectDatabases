import * as THREE from 'three';
import {MeshBVH, StaticGeometryGenerator} from "three-mesh-bvh";

const objectLoader = new THREE.ObjectLoader();

onmessage = ( { data } ) => {
    console.log("ColliderWorker received message.");
    const json = JSON.parse(data);
    const models = [];
    for(const index in json){
        models.push(objectLoader.parse(json[index]));
    }
    let staticGenerator = new StaticGeometryGenerator(models);
    staticGenerator.attributes = [ 'position' ];

    let mergedGeometry = staticGenerator.generate();

    postMessage(JSON.stringify({geometry: mergedGeometry.toNonIndexed().toJSON(), boundsTree: MeshBVH.serialize(new MeshBVH( mergedGeometry ))}));
}

onerror = (e) => {
    console.error(e);
}