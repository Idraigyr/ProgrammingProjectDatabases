import {WorldManager} from "./WorldManager.js";
import {CameraManager} from "./CameraManager.js";
import {CharacterController} from "./CharacterController.js";
import {InputManager} from "./InputManager.js";
import {AssetLoader} from "./AssetLoader.js";
import {CollisionDetector} from "./CollisionDetector.js";
import {UserInfo} from "./UserInfo.js";
import {SpellCaster} from "./SpellCaster.js";

/**
 * Controller object that contains all the controllers (aka controller namespace)
 * @type {{AssetLoader: AssetLoader, WorldLoader: WorldManager, CharacterController: CharacterController, CameraManager: CameraManager, InputManager: InputManager}}
 */
export let Controller = {
    WorldLoader: WorldManager,
    CameraManager: CameraManager,
    InputManager: InputManager,
    CharacterController: CharacterController,
    AssetLoader: AssetLoader,
    CollisionDetector: CollisionDetector,
    UserInfo: UserInfo,
    SpellCaster: SpellCaster
}