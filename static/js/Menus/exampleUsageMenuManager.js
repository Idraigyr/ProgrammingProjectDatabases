
//how to add items to the menuManager (store icons in the assetManager (texture) and call them here as needed).
//item field should be an actual item object from the ItemManager
menuManager.addItems([
    {
        item: new Gem({name: "Ruby1", id: 0, belongsIn: "GemsMenu"}),
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    },
    {
        item: new Gem({name: "Emerald2", id: 1, belongsIn: "GemsMenu"}),
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    },
    {
        item: new Gem({name: "Ruby3", id: 2, belongsIn: "GemsMenu"}),
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    },
    {
        item: new Gem({name: "Ruby", id: 3, belongsIn: "GemsMenu"}),
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    },
    {
        item: new Gem({name: "Sapphire", id: 4, belongsIn: "GemsMenu"}),
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    },
    {
        item: new Gem({name: "Ruby", id: 5, belongsIn: "GemsMenu"}),
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    },
    {
        item: new Gem({name: "Sapphire", id: 6, belongsIn: "GemsMenu"}),
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    },
    {
        item: new Gem({name: "Emerald", id: 7, belongsIn: "GemsMenu"
        }),
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    },
    {
        item: new Gem({name: "Sapphire", id: 8, belongsIn: "GemsMenu"
        }),
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    },
    {
        item: new Spell({name: "Fireball", id: 0, belongsIn: "SpellsMenu"}),
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    },
    {
        item: {name: "tower", id: 0, belongsIn: "CombatBuildingsMenu", getItemId: () => "CombatBuilding0", getDisplayName: () => "Tower1"},
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    },
    {
        item: {name: "tower", id: 1, belongsIn: "CombatBuildingsMenu", getItemId: () => "CombatBuilding1", getDisplayName: () => "Tower2"},
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    },
    {
        item: {name: "tower", id: 2, belongsIn: "CombatBuildingsMenu", getItemId: () => "CombatBuilding2", getDisplayName: () => "Tower3"},
        icon: {src: "https://via.placeholder.com/50", width: 50, height: 50}
    }
    ]
);


//example of what eventlisteners need to be used for
const items = [];
menuManager.addEventListener("addGem", (e) => {
    //add gem to building logic comes here
    items.push(e.detail.id);
});

menuManager.addEventListener("removeGem", (e) => {
    //remove gem to building logic comes here
    items.splice(items.indexOf(e.detail.id), 1);
    console.log(items);
});

menuManager.addEventListener("build", (e) => {
    //build building logic comes here
    console.log("build: ", e.detail.id);
})

//example of how to render a menu/hide a menu
document.addEventListener("keydown", (e) => {
    console.log(e.code);
    if(e.code === "KeyQ"){
        menuManager.hideMenu(menuManager.currentMenu);
    }
    if(e.code === "Digit1"){
        menuManager.renderMenu({name: "AltarMenu"});
    }
    if(e.code === "Digit2"){
        menuManager.renderMenu({name: "TowerMenu", items: items});
    }
    if(e.code === "Digit3"){
        menuManager.renderMenu({name: "FusionTableMenu"});
    }
    if(e.code === "Digit4"){
        menuManager.renderMenu({name: "MineMenu", items: []});
    }
    if (e.code === "Digit5"){
        menuManager.renderMenu({name: "BuildMenu"});
    }
});