// variables

// lists for spells, gems and stakes
let gems = ["emeraldGem", 'sapphireGem'];
let towerGems = ["diamondGem", "rubyGem"];
let boosts = ["hp", "damage"];



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
    if(startContainer === 'container1' && targetContainer.id === 'container2'){
        removeByString(gems, draggedItem.id);
        towerGems.push(draggedItem.id);
        targetContainer.appendChild(draggedItem);
    }
    else if(startContainer === 'container2' && targetContainer.id === 'container1'){
        removeByString(towerGems, draggedItem.id);
        gems.push(draggedItem.id);
        targetContainer.appendChild(draggedItem);
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
    let type = 'Gems';
    if(containerId === 'container2') {
        type = 'Tower Gems';
    }
    else if(containerId === 'container3'){
        type = 'Boosts';
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
        if(type !== 'Boosts') {
            img.src = "/static/images/gems/" + itemName + ".png";
        }
        else if(itemName === "hp"){
            img.src = "/static/images/menu/hp.png";
        }
        else if(itemName === "damage"){
            img.src = "/static/images/menu/damage.png";
        }
        img.alt = itemName;
        img.draggable = false; // Make sure the image is draggable
        img.addEventListener('dragstart', drag); // Handle dragstart event for the image
        item.appendChild(img);
        container.appendChild(item);
    });
}

// Call the function to populate the container
populateContainer('container1', gems);
populateContainer('container2', towerGems);
populateContainer('container3', boosts);



// exit button
document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById('exit');
    button.addEventListener('click', function() {
        // exit menu
    });
});
