// all variables for game settings
import {API_URL, logoutURI, settingsURI} from "../configs/EndpointConfigs.js";
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

/**
 *Map to map keys from settings to the keybinds in config
 */
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

const dbToKeyMap = {
    'move_fwd': 'move-forward',
    'move_left': 'move-left',
    'move_right': 'move-right',
    'move_bkwd': 'move-backwards',
    'jump': 'jump',
    'sprint': 'sprint',
    'eat': 'eat',
    'interact': 'interact',
    'chat': 'chat',
    'slot_1': 'spellSlot1',
    'slot_2': 'spellSlot2',
    'slot_3': 'spellSlot3',
    'slot_4': 'spellSlot4',
    'slot_5': 'spellSlot5'
};

/**
 *Map to store keys from input in the settings menu
 */
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

let dbMap = {
    "move_fwd_key": "KeyW",
    "move_fwd_val": "NULL",
    "move_bkwd_key": "KeyS",
    "move_bkwd_val": "NULL",
    "move_left_key": "KeyA",
    "move_left_val": "NULL",
    "move_right_key": "KeyD",
    "move_right_val": "NULL",
    "jump_key": "Space",
    "jump_val": "NULL",
    "sprint_key": "ShiftLeft",
    "sprint_val": "NULL",
    "eat_key": "KeyQ",
    "eat_val": "NULL",
    "interact_key": "KeyE",
    "interact_val": "NULL",
    "chat_key": "KeyC",
    "chat_val": "NULL",
    "slot_1_key": "Digit1",
    "slot_1_val": "NULL",
    "slot_2_key": "Digit2",
    "slot_2_val": "NULL",
    "slot_3_key": "Digit3",
    "slot_3_val": "NULL",
    "slot_4_key": "Digit4",
    "slot_4_val": "NULL",
    "slot_5_key": "Digit5",
    "slot_5_val": "NULL"
};

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

    /**
     * Function to load the cursors
     */
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

    }/**
     * Send a PUT request to the server
     * @param uri - the URI to send the PUT request to
     * @param entity - the Entity that we want to update in the db
     * @param retries - the number of retries to resend the PUT request
     */
    sendPUT(data){
        console.log(data)
        try {
            $.ajax({
                url: `${API_URL}/${settingsURI}`,
                type: "PUT",
                data: JSON.stringify(data),
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.error(e);
                }
            }).done((data, textStatus, jqXHR) => {
                console.log("PUT success");
                console.log(textStatus, data);
            }).fail((jqXHR, textStatus, errorThrown) => {
                console.log("PUT fail");
                throw new Error(`Could not send PUT request for settings: Error: ${textStatus} ${errorThrown}`);

            });
        } catch (err){
            console.error(err);
        }
    }

    /**
     * Function to apply the volume from the settings menu to the game
     */
    applyVolume(obj){
        let docVolume = document.getElementById('volume');
        volume.overalVolume = docVolume.value;
        obj.audio_volume = parseInt(docVolume.value);

    }

    /**
     * Function to apply the sensitivity from the settings menu to the game
     */

    applySensitivity(obj){
        let docHorizontalSensitivity = document.getElementById('horizontal-sensitivity');
        let docVerticalSensitivity = document.getElementById('vertical-sensitivity');
        sensitivity.horizontalSensitivity = baseHorizontalSensitivity * ( 0.5 + (docHorizontalSensitivity.value/100));
        sensitivity.verticalSensitivity = baseVerticalSensitivity * ( 0.5 + (docVerticalSensitivity.value/100));
        obj.horz_sensitivity = parseInt(docHorizontalSensitivity.value);
        obj.vert_sensitivity = parseInt(docVerticalSensitivity.value);

    }

    /**
     * Function to apply the performance settings from the settings menu to the game
     */

    applyPerformace(obj){
        let docPerformance = document.getElementById('performance');
        if (docPerformance.value === 'low'){
            shadows.shadowCasting = false;
            this.grassOn = false;
            obj.performance = 0;
        }
        if (docPerformance.value === 'middle'){
            shadows.shadowCasting = false;
            this.grassOn = true;
            obj.performance = 1;
        }
        if (docPerformance.value === 'high'){
            shadows.shadowCasting = true;
            this.grassOn = true;
            obj.performance = 2;
        }
        this.dispatchEvent(new CustomEvent("grassChange", {detail : {on: this.grassOn}}));

    }

    /**
     * Function to apply the keybinds from the settings menu to the game
     */

    applyKeys(obj){
        for (let [key, value] of keyMap.entries()) {
            const objectKey = keyMapping[key];
            if (objectKey) {
                keyBinds[objectKey] = value;
            }
        }
        for (let key in dbMap) {
            if (dbMap.hasOwnProperty(key)) {
                console.log(key, dbMap[key])
                obj[key] =  dbMap[key];
            }
        }

    }

    /**
     * Function to apply all the settings from the settings menu to the game
     */

    applySettings(){
        let data = {player_id: this.playerInfo.userID};
        this.applyVolume(data);
        this.applySensitivity(data);
        this.applyPerformace(data);
        this.applyKeys(data);
        this.sendPUT(data);

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
        if(!(event.code === 'Backspace'))
        {
            keyMap.set(event.target.name, event.code);
            const dbKey = dbToKeyMap[event.target.name];
            if (dbKey) {
                dbMap[dbKey + "_key"] = event.code;
                dbMap[dbKey + "_val"] = event.key;
            }
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