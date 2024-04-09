// variables

// crystals and gems var
let crystals = 14;
let gems = {"amberGem": 4, "rubyGem": 3, "sapphireGem": 8, 'diamondGem': 1, "emeraldGem": 2, "amethystGem": 3};
let mineCrystals = 0;
let mineGems = {"amberGem": 0, "rubyGem": 0, "sapphireGem": 0, 'diamondGem': 0, "emeraldGem": 0, "amethystGem": 0};

/*
Fills mine (every hour)
5-25 crystals

50% chance of gem:

40% Amber
30% Ruby
20% Sapphire
6% Diamond
3% Emerald
1% Amethyst
 */
function addGem(){
    mineCrystals += getRandomInt(5, 25);
    let gem = getRandomInt(1, 200);
    if(gem <= 40){
        mineGems["amberGem"]++;
    }
    else if(gem <= 70){
        mineGems["rubyGem"]++;
    }
    else if(gem <= 90){
        mineGems["sapphireGem"]++;
    }
    else if(gem <= 96){
        mineGems["diamondGem"]++;
    }
    else if(gem <= 99){
        mineGems["emeraldGem"]++;
    }
    else if(gem === 100){
        mineGems["amethystGem"]++;
    }
    populateContainers();
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// creates name for gem
function toGemString(inputString) {
    // Make the first letter uppercase
    let processedString = inputString.charAt(0).toUpperCase() + inputString.slice(1);

    // Remove the last 5 letters
    processedString = processedString.slice(0, -3);

    return processedString;
}

function collect(){
    crystals += mineCrystals;
    mineCrystals = 0;
    for(let itemName in mineGems){
        gems[itemName] += mineGems[itemName];
        mineGems[itemName] = 0;
    }
    populateContainers()
}

// create and populate items in the containers
function populateContainer(containerId, itemList, clear) {
    const container = document.getElementById(containerId);
    let type = "Inventory";
    if (containerId === 'container2'){
        type = "Mine";
    }
    if(clear){
        // Clear existing items
        container.innerHTML = '';
        container.innerHTML = '<label><h3>' + type + '</h3></label>';
    }
    // Create and append items based on the input list
    if(typeof(itemList) === 'number' && itemList !== 0){
        // add crystals
        const item = document.createElement('div');
        item.textContent = "Crystals: " + itemList;
        item.id = itemList;
        item.classList.add('item');
        // add img to item
        const img = document.createElement('img');
        img.classList.add("crystal");
        // link to images
        img.src = "/static/images/gems/crystal.png";
        img.alt = itemList;
        img.draggable = false; // Make sure the image is not draggable
        item.appendChild(img);
        container.appendChild(item);
    }
    else {
        for (let itemName in itemList) {
            let amount = itemList[itemName];
            if (amount !== 0) {
                // add item
                const item = document.createElement('div');
                item.textContent = toGemString(itemName) + ": " + amount;
                item.id = itemName;
                item.classList.add('item');
                // add img to item
                const img = document.createElement('img');
                img.classList.add(itemName);
                // link to images
                img.src = "/static/images/gems/" + itemName + ".png";
                img.alt = itemName;
                img.draggable = false; // Make sure the image is not draggable
                item.appendChild(img);
                container.appendChild(item);
            }
        }
    }
}

// Call the function to populate the container
function populateContainers() {
    populateContainer('container1', crystals, true);
    populateContainer('container1', gems, false);
    populateContainer('container2', mineCrystals, true);
    populateContainer('container2', mineGems, false);
}

populateContainers();

function exitMenu(){
    console.log("Mine menu closed");
    window.parent.postMessage("closeMineMenu", "*");
}

// loading progress
function simulateLoading() {
  let progress = 0;
  const progressBar = document.querySelector('.loading-bar');

  const intervalId = setInterval(() => {
    progress += 1; // Increase progress randomly
    progressBar.style.width = `${progress}%`;

    if (progress >= 100) {
      clearInterval(intervalId);
      // Loading complete, hide the loading bar or perform other actions
      addGem();
      simulateLoading();
    }
  }, 100); // Adjust the interval as needed
}

// Call the function to start loading simulation
simulateLoading();