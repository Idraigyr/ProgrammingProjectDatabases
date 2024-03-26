/**
 * In this file you can see default configuration settings for the controller
 *
 */
export const TIMEOUT_SEC = 5;

export let horizontalSensitivity = 0.5;
export let verticalSensitivity = 0.3;
export let zoomSensitivity = 1;

export let minCameraY = 1;

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
export let maxZoomIn = 15;

export let minZoomIn = Math.sqrt(Math.pow(cameraPosition.offset.x,2) + Math.pow(cameraPosition.offset.y,2) + Math.pow(cameraPosition.offset.z,2));