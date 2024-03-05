import {Model} from "../Model/Model";
import {View} from "../View/View";
import {Controller} from "./Controller";
import {PlayerFSM} from "../Patterns/FiniteStateMachine";

export class Factory{
    //TODO: add factory itself and model class of object to view.userData
    constructor(scene) {
        this.scene = scene;
        this.AssetLoader = new Controller.AssetLoader(this.scene);
        this.views = [];
    }

    createMinion(){

    }

    createPlayer(){
        let player = new Model.Wizard();
        player.fsm = new PlayerFSM();
        let view = new View.Player();
        this.AssetLoader.loadGLTF("./assets/Wizard.glb",view);
        console.log(view);
        player.addEventListener("updatePosition",view.updatePosition.bind(view));
        player.addEventListener("updateRotation",view.updateRotation.bind(view));
        console.log(view);
        this.views.push(view);
        return player;
    }
    createIsland(){
        let island = new Model.Island();
        let view = new View.Island();
        //TODO:: load island;
        this.scene.add(view.initScene());
        //this.AssetLoader.loadGLTF("./assets/Wizard.glb",view);
        this.views.push(view);
        return island;
    }
    createFireball(){
        // let fireball = new Model.Fireball();
        // let view = new View.Fireball();
        // this.AssetLoader.loadGLTF("./assets/Wizard.glb",view);
        // return fireball;
    }
}