// variables

// crystals for fusion
let crystals = 555;
let inputCrystals = 0;
let gemsOdds = {"amberGem": [0,100], "rubyGem": [0,30], "sapphireGem": [0,20], 'diamondGem': [0,6], "emeraldGem": [0,3], "amethystGem": [0,1]};
oddIndex = 0;
let outputGems = {"amberGem": 0, "rubyGem": 0, "sapphireGem": 0, 'diamondGem': 0, "emeraldGem": 0, "amethystGem": 0};
let gems = {"amberGem": 4, "rubyGem": 3, "sapphireGem": 8, 'diamondGem': 1, "emeraldGem": 2, "amethystGem": 3};
let fusion = false;
let animation = false;

function calculateOdds(){
    let a;
    let b;
    for(let gem in gemsOdds) {
        for (let i = 1; i < 10; i++) {
            a = gemsOdds[gem][i];
            b = a + Math.ceil(a / 5);
            if (b > 100) {
                b = 100;
            }
            gemsOdds[gem].push(b);
        }
    }
}

calculateOdds();

function startFusion(){
    if(!fusion && inputCrystals !== 0) {
        fusion = true;
        toggleAnimation(true);
        inputCrystals = 0;
        simulateLoading();
        populateContainers();
    }
}

function endFusion(){
    toggleAnimation(false);
    progress = 0;
    for(let gem in gemsOdds) {
        let a = getRandomInt(1, 100);
        if(a <= gemsOdds[gem][oddIndex]){
            outputGems[gem]++;
        }
    }
    oddIndex = 0;
    populateContainers();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function countTotalGems() {
    let totalCount = 0;
    for (let key in outputGems) {
        totalCount += outputGems[key];
    }
    return totalCount;
}

// creates text for gem
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

function drop(event, containerId) {
    event.preventDefault();
    let data = event.dataTransfer.getData("text");
    let draggedItem = document.getElementById(data);
    let startContainer = event.dataTransfer.getData("startContainer");
    let targetContainer = document.getElementById(containerId);

    // Append the dragged item to the target container on right conditions and update data
    if(startContainer === 'container1' && targetContainer.id === 'container2' && crystals >= 10 && inputCrystals !== 100){
        crystals -= 10;
        inputCrystals += 10;
        oddIndex++;
        populateContainers();
    }
    else if(startContainer === 'container2' && targetContainer.id === 'container1' && inputCrystals >= 10){
        crystals += 10;
        inputCrystals -= 10;
        oddIndex--;
        populateContainers();
    }
    else if(startContainer === 'container3' && targetContainer.id === 'container4' && fusion){
        if(outputGems[draggedItem.id] !== 0){
            outputGems[draggedItem.id]--;
            gems[draggedItem.id]++;
        }
        if(countTotalGems() === 0){
            fusion = false;
        }
        populateContainers();
    }
}

// create and populate items in the containers
function populateContainer(containerId, itemList, clear) {
    const container = document.getElementById(containerId);
    let type = "Crystals";
    if (containerId === 'container2'){
        type = "Input";
    }
    else if (containerId === 'container3'){
        if(fusion) {
            type = "Output";
        }
        else{
            type = "Odds";
        }
    }
    else if (containerId === 'container4'){
        type = "Gems";
    }

    // Clear existing items
        container.innerHTML = '';
        container.innerHTML = '<label><h3>' + type + '</h3></label>';

    if(type === "Crystals" || type === "Input"){
        // add crystals
        if(itemList !== 0) {
            const item = document.createElement('div');
            item.textContent = "Crystals: " + itemList;
            item.draggable = true;
            item.id = itemList;
            item.classList.add('item');
            item.addEventListener('dragstart', drag);

            // add img to item
            const img = document.createElement('img');
            img.classList.add("crystal");
            // link to images
            img.src = "/static/images/gems/crystal.png";
            img.alt = itemList;
            img.draggable = false; // Make sure the image is not draggable
            img.addEventListener('dragstart', drag); // Handle dragstart event for the item
            item.appendChild(img);
            container.appendChild(item);
        }
    }
    else {
        for(let itemName in itemList) {
            let amount = itemList[itemName];
            if(type === "Odds"){
                // add item
                    const item = document.createElement('div');
                    item.textContent = toGemString(itemName) + ": " + gemsOdds[itemName][oddIndex] + "%";
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
            else {
                if (amount !== 0) {
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
}

// Call the function to populate the container
function populateContainers() {
    populateContainer('container1', crystals, true);
    populateContainer('container2', inputCrystals, true);
    if(fusion){
        populateContainer('container3', outputGems, true);
    }
    else{
        populateContainer('container3', gemsOdds, true);
    }
    populateContainer('container4', gems, true);
}

populateContainers();

// fusion loading
function simulateLoading() {
    let progress = 0;
    const progressBar = document.querySelector('.loading-bar');

    const intervalId = setInterval(() => {
      progress += 1;
      progressBar.style.width = `${progress}%`;
      if (progress >= 100) {
        clearInterval(intervalId);
        // Loading complete
        endFusion();
      }
    }, 100); // Adjust the interval as needed
}

// Get the arrow element
const arrow = document.getElementById('arrow');

// Function to start or stop the animation based on condition
function toggleAnimation(condition) {
    if (condition) {
        arrow.classList.add('move-right');
    } else {
        arrow.classList.remove('move-right');
    }
}

function exitMenu() {
    // Your code to handle closing the menu goes here
    // Send message to parent
    window.parent.postMessage("closeFusionTableMenu", "*");
}
