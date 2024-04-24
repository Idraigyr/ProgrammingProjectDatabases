// all variables for game settings

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






export class settings {
    constructor(inputManager) {
        this.inputManager = inputManager;
        inputManager.addLogoutButtonListener(this.logOut.bind(this))
        inputManager.addSettingsCloseButtonListener(this.exitSettingsMenu.bind(this))
    }
    /**
     * Function to log out the user
     */
    logOut() {
        console.log("Log out button clicked")
        var currentUrl = window.location.href;

        // Append '/logout' to the current URL
        var logoutUrl = currentUrl + '/logout';

        // Redirect the user to the logout URL
        window.location.href = logoutUrl;
    }
    /**
     * Function to exit the settings menu
     */
    exitSettingsMenu() {
        const settingsMenu = document.querySelector(`.settings-container`);
        settingsMenu.classList.toggle('hide');
    }

}