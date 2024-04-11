// variables

// lists for spells, gems and stakes
let spells = ["fireSpell", "freezeSpell", "shieldSpell", "healSpell", "thunderSpell"];
let hotbar = ["buildSpell"]
let gems = {"amberGem": 4, "rubyGem": 3, "sapphireGem": 8, 'diamondGem': 1, "emeraldGem": 2, "amethystGem": 3};
let stakes = {"amberGem": 0, "rubyGem": 0, "sapphireGem": 0, 'diamondGem': 0, "emeraldGem": 0, "amethystGem": 0};


// play button
document.addEventListener("DOMContentLoaded", function() {
    // Select the button and text input elements by their ids
    const button = document.getElementById('playButton');

    // Add an event listener to the button
    button.addEventListener('click', function() {
        // start multiplayer battle
    });
});


// functions for dragging items
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
    event.dataTransfer.setData("startContainer", event.target.parentNode.id);
}

function drop(event, containerId) {
    // event.preventDefault();
    let data = event.dataTransfer.getData("text");
    let draggedItem = document.getElementById(data);
    let startContainer = event.dataTransfer.getData("startContainer");
    let targetContainer = document.getElementById(containerId);

    // Append the dragged item to the target container on right conditions and update data
    if(startContainer === 'container1' && targetContainer.id === 'container2' && hotbar.length !== 5){
        targetContainer.appendChild(draggedItem);
        removeByString(spells, draggedItem.id);
        hotbar.push(draggedItem.id);

    }
    else if(startContainer === 'container2' && targetContainer.id === 'container1'){
        if(draggedItem.id !== "buildSpell") {
            targetContainer.appendChild(draggedItem);
            removeByString(hotbar, draggedItem.id);
            spells.push(draggedItem.id);
        }
    }
    else if(startContainer === 'container3' && targetContainer.id === 'container4'){
        if(gems[draggedItem.id] !== 0){
            gems[draggedItem.id]--;
            stakes[draggedItem.id]++;
        }
        populateContainer('container3', gems);
        populateContainer('container4', stakes);
    }
    else if(startContainer === 'container4' && targetContainer.id === 'container3'){
        if(stakes[draggedItem.id] !== 0){
            stakes[draggedItem.id]--;
            gems[draggedItem.id]++;
        }
        populateContainer('container3', gems);
        populateContainer('container4', stakes);
    }
}

// creates name for spell
function toSpellString(inputString) {
    // Make the first letter uppercase
    let processedString = inputString.charAt(0).toUpperCase() + inputString.slice(1);

    // Remove the last 5 letters
    processedString = processedString.slice(0, -5);

    return processedString;
}

// creates name for gem
function toGemString(inputString) {
    // Make the first letter uppercase
    let processedString = inputString.charAt(0).toUpperCase() + inputString.slice(1);

    // Remove the last 5 letters
    processedString = processedString.slice(0, -3);

    return processedString;
}

// Function to remove an element by its string value
function removeByString(array, value) {
    const index = array.indexOf(value);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

// create and populate items in the containers
function populateContainer(containerId, itemList) {
    let type = 'Spells';
    if(containerId === 'container2') {
        type = 'Hotbar';
    }
    else if(containerId === 'container3'){
        type = 'Gems';
    }
    else if(containerId === 'container4'){
        type = 'Stakes';
    }
    const container = document.getElementById(containerId);

    // Clear existing items
    container.innerHTML = '';

    container.innerHTML = '<label><h3>' + type + '</h3></label>';

    // Create and append items based on the input list
    // for spells
    if(type === 'Spells' || type === 'Hotbar'){
        itemList.forEach((itemName, index) => {
            // add item
            const item = document.createElement('div');
            item.textContent = toSpellString(itemName) + " spell";
            item.draggable = true;
            item.id = itemName;
            item.classList.add('item');
            item.addEventListener('dragstart', drag);

            // add img to item
            const img = document.createElement('img');
            img.classList.add(itemName);
            // link to images
            img.src = "/static/images/spells/" + itemName + ".png";
            img.alt = itemName;
            img.draggable = false; // Make sure the image is not draggable
            img.addEventListener('dragstart', drag); // Handle dragstart event for the item
            item.appendChild(img);
            container.appendChild(item);
        });
    }
    else{
        for(let itemName in itemList) {
            let amount = itemList[itemName];
            if(amount !== 0) {
                // add item
                const item = document.createElement('div');
                item.textContent = toGemString(itemName) + ": " + amount;
                item.draggable = true;
                item.id = itemName;
                item.classList.add('item');
                item.addEventListener('dragstart', drag);

                // add img to item
                const img = document.createElement('img');
                img.classList.add(itemName);
                // link to images
                img.src = "/static/images/gems/" + itemName + ".png";
                img.alt = itemName;
                img.draggable = false; // Make sure the image is not draggable
                img.addEventListener('dragstart', drag); // Handle dragstart event for the item
                item.appendChild(img);
                container.appendChild(item);
            }
        }
    }
}

// Call the function to populate the container
populateContainer('container1', spells);
populateContainer('container2', hotbar);
populateContainer('container3', gems);
populateContainer('container4', stakes);

function exitMenu() {
    // Your code to handle closing the menu goes here
    // Send message to parent
    window.parent.postMessage("closeAltarMenu", "*");
}
