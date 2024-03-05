import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import {
    horizontalSensitivity, maxZoomDistance, minZoomDistance,
    primaryBackwardKey,
    DownKey, primaryForwardKey,
    primaryLeftKey,
    primaryRightKey,
    upKey, secondaryBackwardKey, secondaryForwardKey,
    secondaryLeftKey,
    secondaryRightKey, movementSpeed, verticalSensitivity, zoomSensitivity, sprintMultiplier
} from "./config";
import {max, min} from "../helpers";
import {FBXLoader, GLTFLoader} from "three/addons";
import {WorldManager} from "./WorldManager";
import {CameraManager} from "./CameraManager";
import {CharacterController} from "./CharacterController";
import {InputManager} from "./InputManager";
import {AssetLoader} from "./AssetLoader";

export let Controller = {
    WorldLoader: WorldManager,
    CameraManager: CameraManager,
    InputManager: InputManager,
    CharacterController: CharacterController,
    AssetLoader: AssetLoader
}