// variables

// lists for spells, gems and stakes
let spells = ["fireSpell", "freezeSpell", "shieldSpell"];
let gems = ["diamond", "ruby", "emerald", 'sapphire'];
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
}

function drop(event, containerId) {
    event.preventDefault();
    var data = event.dataTransfer.getData("text");
    var draggedItem = document.getElementById(data);
    var targetContainer = document.getElementById(containerId);

    // Append the dragged item to the target container
    targetContainer.appendChild(draggedItem);
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
    container.innerHTML = '<label><h2>' + type + '</h2></label>';

    // Create and append items based on the itemList
    itemList.forEach((itemName, index) => {
        // add item
        const item = document.createElement('div');
        item.textContent = itemName;
        item.draggable = true;
        item.id = 'item' + (index + 1);
        item.classList.add('item');
        item.addEventListener('dragstart', drag);

        // add img to item
        const img = document.createElement('img');
        img.classList.add(itemName);
        // temporary link to png because js changes prefix
        if(type === 'Spells') {
            img.src = "http://localhost:63342/ProgrammingProjectDatabases/static/images/spells/" + itemName + ".png";
        }
        else if(type === "Gems"){
            img.src = "http://localhost:63342/ProgrammingProjectDatabases/static/images/gems/" + itemName + ".png";
        }
        img.alt = itemName;
        img.draggable = true; // Make sure the image is draggable
        img.addEventListener('dragstart', drag); // Handle dragstart event for the image
        item.appendChild(img);
        container.appendChild(item);
    });
}

// Call the function to populate the container
populateContainer('container1', spells);
populateContainer('container2', gems);
populateContainer('container3', stakes);
