/**
 * In this file you can see default configuration settings for the controller
 *
 */
export const TIMEOUT_SEC = 5;

export let horizontalSensitivity = 0.5;
export let verticalSensitivity = 0.3;
export let zoomSensitivity = 1;

export let minCameraY = 1;
//!!!make sure maxZoomIn's number is high enough to reach above the minCameraY threshold, otherwise infinite loop!!!
export let maxZoomIn = -8;

//currently does not do anything;
export let minZoomIn = 1.2;

export const movementSpeed = 7;

export const spellCastMovementSpeed = 2;

export const gravity = -40;

export const jumpHeight = 13;

export const sprintMultiplier = 2;

export const playerSpawn = {
    x: 8,
    y: 15,
    z: 12
}

export const cameraPosition = {
    offset: {
        x: -5,
        y: 2,
        z: 1
    },
    lookAt: {
        x: 500,
        y: 0,
        z: 0
    }
}
