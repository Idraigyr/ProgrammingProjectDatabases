// all variables for game settings
import {API_URL, logoutURI} from "../configs/EndpointConfigs.js";
import {Subject} from "../Patterns/Subject.js";
import { } from "../Controller/PlayerInfo.js";
import {cursorImgPaths, shadows} from "../configs/ViewConfigs.js";
import {
    baseHorizontalSensitivity,
    baseVerticalSensitivity,
    sensitivity,
    volume
} from "../configs/ControllerConfigs.js";
import {keyBinds} from "../configs/Keybinds.js";

// Define the mapping object
const keyMapping = {
    'move-forward': 'primaryForwardKey',
    'move-left': 'primaryLeftKey',
    'move-right': 'primaryRightKey',
    'move-backwards': 'primaryBackwardKey',
    'jump': 'upKey',
    'sprint': 'sprintKey',
    'interact': 'interactKey',
    'eat': 'eatingKey',
    'chat': 'chatKey',
    'spellSlot1': 'slot1Key',
    'spellSlot2': 'slot2Key',
    'spellSlot3': 'slot3Key',
    'spellSlot4': 'slot4Key',
    'spellSlot5': 'slot5Key'
};

let keyMap = new Map();
keyMap.set('move-forward', 'KeyW');
keyMap.set('move-left', 'KeyA');
keyMap.set('move-right', 'KeyD');
keyMap.set('move-backwards', 'KeyS');
keyMap.set('jump', 'Space');
keyMap.set('sprint', 'ShiftLeft');
keyMap.set('interact', 'keyE');
keyMap.set('eat', 'KeyQ');
keyMap.set('chat', 'KeyC');
keyMap.set('spellSlot1', 'Digit1');
keyMap.set('spellSlot2', 'Digit2');
keyMap.set('spellSlot3', 'Digit3');
keyMap.set('spellSlot4', 'Digit4');
keyMap.set('spellSlot5', 'Digit5');

export class Settings extends Subject{
    grassOn = true;
    constructor(params) {
        super(params);
        this.map = null;
        this.inputManager = params.inputManager;
        this.playerInfo = params.playerInfo;

        this.inputManager.addLeaveMatchButtonListener((e) => {
            params.callbacks.leaveMatch();
            this.exitSettingsMenu();
        });

        this.inputManager.addLogoutButtonListener(this.logOut.bind(this))
        this.inputManager.addRespawnButtonListener(this.respawn.bind(this));
        this.inputManager.addSettingsCloseButtonListener(this.exitSettingsMenu.bind(this))
        this.inputManager.addDeleteAccountButtonListener(this.deleteAccountCallback.bind(this))
        this.inputManager.addApplyButtonListener(this.applySettings.bind(this))
        this.inputManager.addFullscreenButtonListener(this.toggleFullscreen.bind(this))
        this.inputManager.addHelpButtonListener(this.toggleHelpMenu.bind(this))
        this.inputManager.addHelpCloseButtonListener(this.toggleHelpMenu.bind(this))
        const keybinds = document.querySelector('.key-binds');
        keybinds.addEventListener('keydown', this.changeKeyBind.bind(this));
    }

    /*toggleGrass(event) {
        console.log("Grass toggle button clicked ", event);
        this.grassOn = !!event.target.checked;
        // Dispatch event to toggle grass
        this.worldManager.toggleGrass(this.grassOn);
        //TODO: add a callback don't add worldmanager directly
    }*/

    loadCursors() {
        const cursors = document.querySelector('.cursors');
        for(let cursor in cursorImgPaths) {
            const cursorDiv = document.createElement('div');
            cursorDiv.addEventListener('click', this.switchCursor.bind(this));
            const cursorName = document.createElement('p');
            const cursorImg = document.createElement('img');
            cursorImg.src = cursorImgPaths[cursor];
            cursorName.innerHTML = cursor;
            cursorDiv.classList.add('cursor');
            cursorDiv.dataset.cursor = cursor;
            cursorDiv.classList.add('cursor-options');
            cursorImg.classList.add('cursor-img');
            cursorName.classList.add('cursor-name');
            cursorImg.style.pointerEvents = 'none';
            cursorName.style.pointerEvents = 'none';
            cursorDiv.appendChild(cursorName);
            cursorDiv.appendChild(cursorImg);
            cursors.appendChild(cursorDiv);
        }
    }

    /**
     * Function to log out the user
     */
    async logOut() {
        // Send logout info to the backend
        await this.playerInfo.logout();
        // Redirect the user to the logout URL
        window.location.href = `${API_URL}/logout`;
    }

    async respawn() {
        // Send respawn info to the backend
        await this.playerInfo.reload();
    }

    /**
     * Function to log out the user
     */
    leaveMatch() {
        console.log("Leave match button clicked")
    }

    /**
     * Function to exit the settings menu
     */
    exitSettingsMenu() {
        const settingsMenu = document.querySelector(`.settings-container`);
        settingsMenu.classList.toggle('hide');

    }

    /**
     * Function to delete your account
     */
    deleteAccountCallback() {
        if (confirm("Are you sure you want to PERMANENTLY remove your account?\nThis cannot be undone!")) {
            $.ajax({
                url: `${API_URL}/api/user_profile?id=${this.playerInfo.userID}`,
                type: "DELETE",
                contentType: "application/json",
                error: (e) => {
                    console.error(e);
                }
            }).done((data, textStatus, jqXHR) => {
                console.log("DELETE success");
                alert("Account deletion successful. You will now be logged out.");
                window.location.href = "/logout"; // Redirect to the logout page, which will redirect to the landing page
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log("DELETE fail");
                alert("Account deletion failed. Please try again later.");
                throw new Error(`Could not send DELETE request for account deletion: ${textStatus} ${errorThrown}`);
            });

        } else {
            console.log("Account deletion cancelled")
        }

    }

    /**
     * Function to apply the volume from the settings menu to the game
     */
    applyVolume(){
        let docVolume = document.getElementById('volume');
        volume.overalVolume = docVolume.value;
    }

    /**
     * Function to apply the sensitivity from the settings menu to the game
     */

    applySensitivity(){
        let docHorizontalSensitivity = document.getElementById('horizontal-sensitivity');
        let docVerticalSensitivity = document.getElementById('vertical-sensitivity');
        sensitivity.horizontalSensitivity = baseHorizontalSensitivity * ( 0.5 + (docHorizontalSensitivity.value/100));
        sensitivity.verticalSensitivity = baseVerticalSensitivity * ( 0.5 + (docVerticalSensitivity.value/100));
    }

    /**
     * Function to apply the performance settings from the settings menu to the game
     */

    applyPerformace(){
        let docPerformance = document.getElementById('performance');
        if (docPerformance.value === 'low'){
            shadows.shadowCasting = false;
            this.grassOn = false;
        }
        if (docPerformance.value === 'middle'){
            shadows.shadowCasting = false;
            this.grassOn = true;
        }
        if (docPerformance.value === 'high'){
            shadows.shadowCasting = true;
            this.grassOn = true;
        }
        this.dispatchEvent(new CustomEvent("grassChange", {detail : {on: this.grassOn}}));
    }

    /**
     * Function to apply the keybinds from the settings menu to the game
     */

    applyKeys(){
        for (let [key, value] of keyMap.entries()) {
            const objectKey = keyMapping[key];
            if (objectKey) {
                keyBinds[objectKey] = value;
            }
        }
    }

    /**
     * Function to apply all the settings from the settings menu to the game
     */

    applySettings(){
        this.applyVolume();
        this.applySensitivity();
        this.applyPerformace();
        this.applyKeys();
        console.log(keyBinds)

        this.exitSettingsMenu();
    }

    /**
     * Function to switch the cursor
     * @param event
     */
    switchCursor(event) {
        const crosshair = document.querySelector('#crosshair-img');
        crosshair.src = cursorImgPaths[event.target.dataset.cursor];
    }
    /**
    * Function to change the keybinds
     */
    changeKeyBind(event) {
        console.log(event.code);
        if(!(event.code === 'Backspace'))
        {
                    keyMap.set(event.target.name, event.code);
        }
    }

    /**
     * Function to toggle fullscreen
     */

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            try {
                document.documentElement.requestFullscreen();
            }
            catch (e) {
                console.error(e);
            }
        }
    }

    /**
     * Function to toggle the help menu
     */

    toggleHelpMenu() {
        const helpMenu = document.querySelector('.help-container');
        helpMenu.classList.toggle('hide');
    }
}