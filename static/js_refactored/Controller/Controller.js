import {WorldManager} from "./WorldManager.js";
import {CameraManager} from "./CameraManager.js";
import {CharacterController} from "./CharacterController.js";
import {InputManager} from "./InputManager.js";
import {AssetLoader} from "./AssetLoader.js";

export let Controller = {
    WorldLoader: WorldManager,
    CameraManager: CameraManager,
    InputManager: InputManager,
    CharacterController: CharacterController,
    AssetLoader: AssetLoader,
}