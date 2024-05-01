// all variables for game settings
import { API_URL } from "../configs/EndpointConfigs.js";
import { } from "../Controller/PlayerInfo.js";

let volume = 50;
let soundEffects = true;
let backgroundMusic = true;
let resolution = 1080;
let keyBinds = new Map();
keyBinds.set('moveForward', 'w');
keyBinds.set('moveLeft', 'a');
keyBinds.set('moveRight', 'd');
keyBinds.set('moveBackwards', 's');
keyBinds.set('jump', ' ');
keyBinds.set('openInventory', 'e');
keyBinds.set('attack', 'LMB');
keyBinds.set('pause', 'Esc');

// changing the variables when changed and applied in settings menu
/**
 * Function to change the game settings
 */
document.addEventListener("DOMContentLoaded", function() {
    // Select the button and text input elements by their ids
    const button = document.getElementById('applyButton');

    // Add an event listener to the button
    button.addEventListener('click', function() {

        // Retrieve the values from the settings menu input fields
        volume = document.getElementById("volume").value;
        soundEffects = document.getElementById("sound").checked;
        backgroundMusic = document.getElementById("music").checked;
        resolution = document.getElementById("resolution").value;
        keyBinds.set('moveForward', document.getElementById('move-forward').value);
        keyBinds.set('moveForward', document.getElementById('move-left').value);
        keyBinds.set('moveForward', document.getElementById('move-right').value);
        keyBinds.set('moveForward', document.getElementById('move-backwards').value);
        keyBinds.set('moveForward', document.getElementById('jump').value);
        keyBinds.set('moveForward', document.getElementById('open-inventory').value);
        keyBinds.set('moveForward', document.getElementById('attack').value);
        keyBinds.set('moveForward', document.getElementById('pause').value);
        alert("Changes applied!");
    });
});






export class Settings {
    constructor(inputManager, playerInfo) {
        this.inputManager = inputManager;
        this.playerInfo = playerInfo;
        inputManager.addLogoutButtonListener(this.logOut.bind(this));
        inputManager.addRespawnButtonListener(this.respawn.bind(this));
        inputManager.addSettingsCloseButtonListener(this.exitSettingsMenu.bind(this));
        inputManager.addDeleteAccountButtonListener(this.deleteAccountCallback.bind(this));
    }
    /**
     * Function to log out the user
     */
    async logOut() {
        console.log("Log out button clicked")
        var currentUrl = window.location.href;

        // Append '/logout' to the current URL
        var logoutUrl = currentUrl + '/logout';

        // Send logout info to the backend
        await this.playerInfo.logout();

        // Redirect the user to the logout URL
        window.location.href = logoutUrl;
    }
    async respawn() {
        console.log("Respawn button clicked")

        // Send respawn info to the backend
        await this.playerInfo.respawn();
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
            console.log("Account deletion confirmed")
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

}