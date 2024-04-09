// variables

// lists for gems, towerGems and boosts
let gems = {"amberGem": 4, "rubyGem": 3, "sapphireGem": 8, 'diamondGem': 1, "emeraldGem": 2, "amethystGem": 3};
let towerGems = {"amberGem": 0, "rubyGem": 0, "sapphireGem": 0, 'diamondGem': 0, "emeraldGem": 0, "amethystGem": 0};
let boosts = {"hp": 100, "damage": 10};
/*
Boosts:
gem       |hp  |damage
----------|----|------
Amber     |10  |10
Ruby      |100 |5
Sapphire  |50  |20
Diamond   |300 |10
Emerald   |100 |50
Amethyst  |500 |20

Max 3 gems in tower
*/

// build spell always
// scrolling
// transparant


// creates name for gem
function toGemString(inputString) {
    // Make the first letter uppercase
    let processedString = inputString.charAt(0).toUpperCase() + inputString.slice(1);

    // Remove the last 5 letters
    processedString = processedString.slice(0, -3);

    return processedString;
}

// functions for dragging items
function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
    event.dataTransfer.setData("startContainer", event.target.parentNode.id);
}

// count amount of gems in tower
function countTotalGems() {
    let totalCount = 0;
    for (let key in towerGems) {
        totalCount += towerGems[key];
    }
    return totalCount;
}

// update boosts according to selected gems
function updateBoosts(gem, operation){
    if(operation === "plus") {
        if (gem === "amberGem") {
            boosts["hp"] += 10;
            boosts["damage"] += 10;
        }
        else if(gem === "rubyGem") {
            boosts["hp"] += 100;
            boosts["damage"] += 5;
        }
        else if(gem === "sapphireGem") {
            boosts["hp"] += 50;
            boosts["damage"] += 20;
        }
        else if(gem === "diamondGem") {
            boosts["hp"] += 300;
            boosts["damage"] += 10;
        }
        else if(gem === "emeraldGem") {
            boosts["hp"] += 100;
            boosts["damage"] += 50;
        }
        else if(gem === "amethystGem") {
            boosts["hp"] += 500;
            boosts["damage"] += 20;
        }
    }
    else{
        if (gem === "amberGem") {
            boosts["hp"] -= 10;
            boosts["damage"] -= 10;
        }
        else if(gem === "rubyGem") {
            boosts["hp"] -= 100;
            boosts["damage"] -= 5;
        }
        else if(gem === "sapphireGem") {
            boosts["hp"] -= 50;
            boosts["damage"] -= 20;
        }
        else if(gem === "diamondGem") {
            boosts["hp"] -= 300;
            boosts["damage"] -= 10;
        }
        else if(gem === "emeraldGem") {
            boosts["hp"] -= 100;
            boosts["damage"] -= 50;
        }
        else if(gem === "amethystGem") {
            boosts["hp"] -= 500;
            boosts["damage"] -= 20;
        }
    }
}

function drop(event, containerId) {
    event.preventDefault();
    let data = event.dataTransfer.getData("text");
    let draggedItem = document.getElementById(data);
    let startContainer = event.dataTransfer.getData("startContainer");
    let targetContainer = document.getElementById(containerId);

    // Append the dragged item to the target container on right conditions and update data
    if(startContainer === 'container1' && targetContainer.id === 'container2' && countTotalGems() !== 3){
        if(gems[draggedItem.id] !== 0 && towerGems[draggedItem.id] === 0){
            gems[draggedItem.id]--;
            towerGems[draggedItem.id]++;
            updateBoosts(draggedItem.id, "plus");
        }
        populateContainers();
    }
    else if(startContainer === 'container2' && targetContainer.id === 'container1'){
        if(towerGems[draggedItem.id] !== 0){
            towerGems[draggedItem.id]--;
            gems[draggedItem.id]++;
            updateBoosts(draggedItem.id, "minus");
        }
        populateContainers();
    }
}

// create and populate items in the containers
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

    // Create and append items based on the input list
    for(let itemName in itemList) {
        let amount = itemList[itemName];
        if(amount !== 0) {
            // add item
            const item = document.createElement('div');
            if(type === 'Boosts'){
                item.textContent = itemName.charAt(0).toUpperCase() + itemName.slice(1) + ": " + amount;
                item.draggable = false;
            }
            else {
                item.textContent = toGemString(itemName) + ": " + amount;
                item.draggable = true;
            }
            item.id = itemName;
            item.classList.add('item');
            item.addEventListener('dragstart', drag);

            // add img to item
            const img = document.createElement('img');
            img.classList.add(itemName);
            // link to images
            if(type === 'Boosts'){
                img.src = "/static/images/menu/" + itemName + ".png";
            }
            else {
                img.src = "/static/images/gems/" + itemName + ".png";
            }
            img.alt = itemName;
            img.draggable = false; // Make sure the image is not draggable
            img.addEventListener('dragstart', drag); // Handle dragstart event for the item
            item.appendChild(img);
            container.appendChild(item);
        }
    }
}

// Call the function to populate the container
function populateContainers() {
    populateContainer('container1', gems);
    populateContainer('container2', towerGems);
    populateContainer('container3', boosts);
}

populateContainers();

function exitMenu() {
    // Your code to handle closing the menu goes here
    console.log("Tower menu closed");
    // Send message to parent
    window.parent.postMessage("closeTowerMenu", "*");
}
