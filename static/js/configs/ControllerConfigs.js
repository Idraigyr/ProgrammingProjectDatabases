/**
 * In this file you can see default configuration settings for the controller
 *
 */
export const TIMEOUT_SEC = 5;

//-- Camera --//
export let horizontalSensitivity = 0.25;
export let verticalSensitivity = 0.15;
export let zoomSensitivity = 1;

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
export const maxZoomIn = 15;

export const minZoomIn = Math.sqrt(Math.pow(cameraPosition.offset.x,2) + Math.pow(cameraPosition.offset.y,2) + Math.pow(cameraPosition.offset.z,2));

//-- Character physics --//
export const movementSpeed = 9;

export const spellCastMovementSpeed = 2;

export const gravity = -40;

export const physicsSteps = 4;

export const jumpHeight = 15;

export const sprintMultiplier = 2;

export const playerSpawn = {
    x: -8.5,
    y: 50,
    z: -10
}

//-- Minions --//
export const minionAttackRadius = 4;
export const minionFollowRadius = 10;
export const minionSpeedMultiplier = 200;

//-- Gems --//
export const powerScaling = 0.5;

export const fusionTime = 2;

//-- multiplayer --//
export const minTotalPowerForStakes = { //TODO: compute this value based on lvl?
    1: 1,
    2: 1,
    3: 1,
    4: 1,
};
