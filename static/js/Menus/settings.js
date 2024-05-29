// all variables for game settings
import {API_URL, logoutURI} from "../configs/EndpointConfigs.js";
import { } from "../Controller/PlayerInfo.js";
import {cursorImgPaths} from "../configs/ViewConfigs.js";
import {
    baseHorizontalSensitivity,
    baseVerticalSensitivity,
    overalVolume,
    sensitivity,
    volume
} from "../configs/ControllerConfigs.js";

let keyBinds = new Map();
keyBinds.set('move-forward', 'w');
keyBinds.set('move-left', 'a');
keyBinds.set('move-right', 'd');
keyBinds.set('move-backwards', 's');
keyBinds.set('jump', ' ');
keyBinds.set('open-inventory', 'e');
keyBinds.set('eat', 'q');

export class Settings {
    grassOn = true;
    constructor(params) {
        this.map = null;
        this.inputManager = params.inputManager;
        /* TODO: look and see
        this.worldManager = params.worldManager;

         */
        this.playerInfo = params.playerInfo;

        this.inputManager.addLeaveMatchButtonListener((e) => {
            params.callbacks.leaveMatch();
            this.exitSettingsMenu();
        });

        this.inputManager.addLogoutButtonListener(this.logOut.bind(this))
        this.inputManager.addRespawnButtonListener(this.respawn.bind(this));
        this.inputManager.addSettingsCloseButtonListener(this.exitSettingsMenu.bind(this))
        this.inputManager.addDeleteAccountButtonListener(this.deleteAccountCallback.bind(this))
        this.inputManager.addGrassToggleListener(this.toggleGrass.bind(this));
        this.inputManager.addApplyButtonListener(this.applySettings.bind(this))
        this.inputManager.addFullscreenButtonListener(this.toggleFullscreen.bind(this))
        this.inputManager.addHelpButtonListener(this.toggleHelpMenu.bind(this))
        this.inputManager.addHelpCloseButtonListener(this.toggleHelpMenu.bind(this))
        const keybinds = document.querySelector('.key-binds');
        keybinds.addEventListener('keydown', this.changeKeyBind.bind(this));
    }

    toggleGrass(event) {
        console.log("Grass toggle button clicked ", event);
        this.grassOn = !!event.target.checked;
        // Dispatch event to toggle grass
        //this.worldManager.toggleGrass(this.grassOn);
        //TODO: add a callback don't add worldmanager directly
    }

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
    applyVolume(){
        let docVolume = document.getElementById('volume');
        volume.overalVolume = docVolume.value;
    }

    applySensitivity(){
        let docHorizontalSensitivity = document.getElementById('horizontal-sensitivity');
        let docVerticalSensitivity = document.getElementById('vertical-sensitivity');
        sensitivity.horizontalSensitivity = baseHorizontalSensitivity * ( 0.5 + (docHorizontalSensitivity.value/100));
        sensitivity.verticalSensitivity = baseVerticalSensitivity * ( 0.5 + (docVerticalSensitivity.value/100));
    }

    applySettings(){
        this.applyVolume();
        this.applySensitivity();

        this.exitSettingsMenu();
    }


    switchCursor(event) {
        const crosshair = document.querySelector('#crosshair-img');
        crosshair.src = cursorImgPaths[event.target.dataset.cursor];
    }

    changeKeyBind(event) {
        console.log(event);
    }

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

    toggleHelpMenu() {
        const helpMenu = document.querySelector('.help-container');
        helpMenu.classList.toggle('hide');
    }
}