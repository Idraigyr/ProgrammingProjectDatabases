import {WorldManager} from "./WorldManager.js";
import {CameraManager} from "./CameraManager.js";
import {CharacterController} from "./CharacterController.js";
import {InputManager} from "./InputManager.js";
import {AssetLoader} from "./AssetLoader.js";
import {CollisionDetector} from "./CollisionDetector.js";
import {UserInfo} from "./UserInfo.js";
import {SpellCaster} from "./SpellCaster.js";
import {ViewManager} from "./ViewManager.js";
import {RaycastController} from "./RaycastController.js";
import {TimerManager} from "./TimerManager.js";
import {AssetManager} from "./AssetManager.js";
import {BuildManager} from "./BuildManager.js";

/**
 * Controller object that contains all the controllers (aka controller namespace)
 * @type {{AssetLoader: AssetLoader, WorldLoader: WorldManager, CharacterController: CharacterController, CameraManager: CameraManager, InputManager: InputManager}}
 */
export const Controller = Object.freeze({
    AssetLoader: AssetLoader,
    WorldLoader: WorldManager,
    AssetManager: AssetManager,
    BuildManager: BuildManager,
    CameraManager: CameraManager,
    InputManager: InputManager,
    TimerManager: TimerManager,
    ViewManager: ViewManager,
    WorldManager: WorldManager,
    CharacterController: CharacterController,
    RaycastController: RaycastController,
    CollisionDetector: CollisionDetector,
    UserInfo: UserInfo,
    SpellCaster: SpellCaster
});