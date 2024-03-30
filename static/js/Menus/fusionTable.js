// variables

// crystals for fusion
let crystals = 5;
let inputCrystals = 3;
let receivedGems = ["emeraldGem"];

function exitMenu() {
    // Your code to handle closing the menu goes here
    console.log("Fusion table menu closed");
    // Send message to parent
    window.parent.postMessage("closeFusionTableMenu", "*");
}
