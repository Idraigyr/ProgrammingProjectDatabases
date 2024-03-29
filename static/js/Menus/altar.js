// variables

// lists for spells, gems and stakes
let spells = ["fireSpell", "freezeSpell", "shieldSpell"];
let gems = ["diamondGem", "rubyGem", "emeraldGem", 'sapphireGem'];
let stakes = [];



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
    event.preventDefault();
    let data = event.dataTransfer.getData("text");
    let draggedItem = document.getElementById(data);
    let startContainer = event.dataTransfer.getData("startContainer");
    let targetContainer = document.getElementById(containerId);

    // Append the dragged item to the target container on right conditions and update lists
    if(draggedItem.id.includes('Spell')){
        if(targetContainer.id === 'container1' || targetContainer.id === 'container3'){
            targetContainer.appendChild(draggedItem);
            if(startContainer === 'container1' && targetContainer.id === 'container3'){
                removeByString(spells, draggedItem.id);
                stakes.push(draggedItem.id);
            }
            else if(startContainer === 'container3' && targetContainer.id === 'container1'){
                removeByString(stakes, draggedItem.id);
                spells.push(draggedItem.id);
            }
        }
    }
    else if(targetContainer.id === 'container2' || targetContainer.id === 'container3'){
            targetContainer.appendChild(draggedItem);
            if(startContainer === 'container2' && targetContainer.id === 'container3'){
                removeByString(gems, draggedItem.id);
                stakes.push(draggedItem.id);
            }
            else if(startContainer === 'container3' && targetContainer.id === 'container2'){
                removeByString(stakes, draggedItem.id);
                gems.push(draggedItem.id);
            }
    }
}

// Function to remove an element by its string value
function removeByString(array, value) {
    const index = array.indexOf(value);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

// create and populate items in the container
function populateContainer(containerId, itemList) {
    let type = 'Spells';
    if(containerId === 'container2') {
        type = 'Gems';
    }
    else if(containerId === 'container3'){
        type = 'Stakes';
    }
    const container = document.getElementById(containerId);

    // Clear existing items
    container.innerHTML = '';

    container.innerHTML = '<label><h3>' + type + '</h3></label>';

    // Create and append items based on the itemList
    itemList.forEach((itemName, index) => {
        // add item
        const item = document.createElement('div');
        item.textContent = itemName;
        item.draggable = true;
        item.id = itemName;
        item.classList.add('item');
        item.addEventListener('dragstart', drag);

        // add img to item
        const img = document.createElement('img');
        img.classList.add(itemName);
        // link to images
        if(type === 'Spells') {
            img.src = "/static/images/spells/" + itemName + ".png";
        }
        else if(type === "Gems"){
            img.src = "/static/images/gems/" + itemName + ".png";
        }
        img.alt = itemName;
        img.draggable = false; // Make sure the image is draggable
        img.addEventListener('dragstart', drag); // Handle dragstart event for the image
        item.appendChild(img);
        container.appendChild(item);
    });
}

// Call the function to populate the container
populateContainer('container1', spells);
populateContainer('container2', gems);
populateContainer('container3', stakes);

function exitMenu() {
    // Your code to handle closing the menu goes here
    console.log("Altar menu closed");
    // Send message to parent
    window.parent.postMessage("closeAltarMenu", "*");
}
