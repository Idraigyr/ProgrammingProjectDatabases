import {WorldManager} from "./WorldManager.js";
import {CameraManager} from "./CameraManager.js";
import {CharacterController} from "./CharacterController.js";
import {InputManager} from "./InputManager.js";
import {AssetLoader} from "./AssetLoader.js";
import {CollisionDetector} from "./CollisionDetector.js";
import {PlayerInfo} from "./PlayerInfo.js";
import {SpellCaster} from "./SpellCaster.js";
import {ViewManager} from "./ViewManager.js";
import {RaycastController} from "./RaycastController.js";
import {TimerManager} from "./TimerManager.js";
import {AssetManager} from "./AssetManager.js";
import {BuildManager} from "./BuildManager.js";
import {MenuManager} from "./MenuManager.js";
import {ItemManager} from "./ItemManager.js";
import {MinionController} from "./MinionController.js";
import {PeerController} from "./PeerController.js";
import {MultiplayerController} from "./MultiplayerController.js";

/**
 * Controller namespace
 * @type {Readonly<{AssetManager: AssetManager, ItemManager: ItemManager, ViewManager: ViewManager, WorldManager: WorldManager, CameraManager: CameraManager, RaycastController: RaycastController, PlayerInfo: PlayerInfo, TimerManager: TimerManager, AssetLoader: AssetLoader, MinionController: MinionController, WorldLoader: WorldManager, CharacterController: CharacterController, BuildManager: BuildManager, MenuManager: MenuManager, CollisionDetector: CollisionDetector, InputManager: InputManager, SpellCaster: SpellCaster}>}
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
    MenuManager: MenuManager,
    ItemManager: ItemManager,
    CharacterController: CharacterController,
    MinionController: MinionController,
    RaycastController: RaycastController,
    CollisionDetector: CollisionDetector,
    PlayerInfo: PlayerInfo,
    SpellCaster: SpellCaster,
    PeerController: PeerController,
    MultiplayerController: MultiplayerController
});