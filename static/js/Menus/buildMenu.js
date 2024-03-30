// variables

// lists buildings
let combat = ["tower"];
let resources = ["fusionTable", "mine"];
let decorations = ["tree", "bush"];

// Function to show buildings or items based on the selected tab
function showBuildings(type) {
    const container = document.getElementById('container1');
    container.innerHTML = ''; // Clear existing items in the container

    // Define lists of buildings and items
    let buildings = ["Building 1", "Building 2", "Building 3"];
    let items = ["Item 1", "Item 2", "Item 3"];

    // Populate the container based on the selected tab
    let itemList;
    if(type === "Combat"){
        itemList = combat;
    }
    else if(type === "Resources"){
        itemList = resources;
    }
    else{
        itemList = decorations;
    }
    populateContainer("container1", itemList, type);
}


function populateContainer(containerId, itemList, type) {
    const container = document.getElementById(containerId);

    // Clear existing items
    container.innerHTML = '';

    container.innerHTML = '<label><h3>' + type + '</h3></label>';

    // Create and append items based on the itemList
    itemList.forEach((itemName, index) => {
        // add item
        const item = document.createElement('div');
        item.textContent = itemName;
        item.id = itemName;
        item.classList.add('item');
        console.log(itemName);
        // add img to item
        const img = document.createElement('img');
        img.classList.add(itemName);
        // link to images
        if(itemName === 'tree') {
            img.src = "/static/images/buildings/tree.png";
        }
        else if(itemName === 'tower') {
            img.src = "/static/images/buildings/tower.png";
        }
        else if(itemName === 'bush') {
            img.src = "/static/images/buildings/bush.png";
        }
        img.alt = itemName;
        item.appendChild(img);
        container.appendChild(item);
    });
}

populateContainer("container1", combat, "Combat");


// exit button
document.addEventListener("DOMContentLoaded", function() {
    const button = document.getElementById('exit');
    button.addEventListener('click', function() {
        // exit menu
    });
});


// play button hover sound
function playHoverSound() {
    let audio = document.getElementById("hoverSound");
    audio.play();
}