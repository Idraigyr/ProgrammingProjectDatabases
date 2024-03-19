/**
 * In this file you can see default configuration settings for the controller
 *
 */
export const API_URL = 'https://team2.ua-ppdb.me:8081';
export const TIMEOUT_SEC = 5;

export let horizontalSensitivity = 0.5;
export let verticalSensitivity = 0.3;
export let zoomSensitivity = 1;

export let minCameraY = 1;
//!!!make sure maxZoomIn's number is high enough to reach above the minCameraY threshold, otherwise infinite loop!!!
export let maxZoomIn = -8;

//currently does not do anything;
export let minZoomIn = 1.2;

export const movementSpeed = 4;

export const sprintMultiplier = 3;
