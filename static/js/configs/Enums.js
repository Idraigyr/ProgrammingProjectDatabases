/**
 * Enum for the different types of game objects
 * @type {{getNumber: (function(*): *), getName: (function(*): *), getMenuName: (function(*): *)}} number - The number of the type
 */
export const buildTypes = (function (){
    const number = {
        void: 0,
        empty: 1,
        bridge: 2,
        altar_building: 3,
        mine_building: 4,
        tower_building: 5,
        prop: 6,
        fuse_table: 7,
        warrior_hut: 8,
        wall_building: 9
    };
    const name = {
        0: "void",
        1: "empty",
        2: "bridge",
        3: "altar_building",
        4: "mine_building",
        5: "tower_building",
        6: "prop",
        7: "fuse_table",
        8: "warrior_hut",
        9: "wall_building"
    }

    const menuName = {
        1: "BuildMenu",
        3: "AltarMenu",
        7: "FusionTableMenu",
        5: "TowerMenu",
        4: "MineMenu",
    }

    return {
        getNumber: function (name) {
            return number[name];
        },
        getName: function (number) {
            return name[number];
        },

        getMenuName: function (number) {
            return menuName[number];
        }
    };
})();

export const gemTypes = (function (){
    const number = {
        Amber: 0,
        Amethyst: 1,
        Diamond: 2,
        Emerald: 3,
        Ruby: 4,
        Sapphire: 5,
    }

    const name = {
        0: "Amber",
        1: "Amethyst",
        2: "Diamond",
        3: "Emerald",
        4: "Ruby",
        5: "Sapphire",
    }

    const icons = {
        0: "./static/assets/images/gems/amber.png",
        1: "./static/assets/images/gems/amethyst.png",
        2: "./static/assets/images/gems/diamond.png",
        3: "./static/assets/images/gems/emerald.png",
        4: "./static/assets/images/gems/ruby.png",
        5: "./static/assets/images/gems/sapphire.png",
    }

    return {
        getNumber: function (name) {
            return number[name];
        },
        getName: function (number) {
            return name[number];
        },
        getIcon: function (number) {
            return icons[number];
        },
        getSize: Object.keys(number).length
    };
})();