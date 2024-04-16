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



// exit button
/**
 * Exit the settings menu
 */
document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById('exit');
    button.addEventListener('click', function() {
        // exit menu
    });
});

