// variables

// lists buildings
let buildings = ["tree", "tower"];

function populateContainer(containerId, itemList) {
    const container = document.getElementById(containerId);

    // Clear existing items
    container.innerHTML = '';

    container.innerHTML = '<label><h3>' + "Buildings" + '</h3></label>';

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
        img.alt = itemName;
        item.appendChild(img);
        container.appendChild(item);
    });
}

// Call the function to populate the container
populateContainer('container1', buildings);