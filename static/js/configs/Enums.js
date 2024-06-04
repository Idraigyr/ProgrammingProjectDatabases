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

    const ctorName = {
        0: undefined,
        1: undefined,
        2: "Bridge",
        3: "Altar",
        4: "Mine",
        5: "Tower",
        6: "Prop",
        7: "FusionTable",
        8: "WarriorHut",
        9: "Wall"
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
        },

        getCtorName: function (number) {
            return ctorName[number];
        },

        getMenuNameFromCtorName: function (ctorName) {
            for (let key in menuName) {
                if (ctorName === this.getCtorName(key)) {
                    return menuName[key];
                }
            }
            return undefined;
        }
    };
})();

/**
 * Enum for the different types of gems
 * @type {{getNumber: (function(*): *), getSize: number, getName: (function(*): *), getIcon: (function(*): *)}}
 */
export const gemTypes = (function (){
    const number = {
        amber: 0,
        amethyst: 1,
        diamond: 2,
        emerald: 3,
        ruby: 4,
        sapphire: 5,
    }

    const name = {
        0: "amber",
        1: "amethyst",
        2: "diamond",
        3: "emerald",
        4: "ruby",
        5: "sapphire",
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

/**
 * List of all the possible multiplayer stats
 * @type {{getKeys: (function(): string[]), getDescription: (function(*): *)}}
 */
export const multiplayerStats = (function (){
    const description = {
        player_kills: "Player Kills",
        player_deaths: "Player Deaths",
        minions_killed: "Minions Killed",
        damage_dealt: "Damage Dealt",
        damage_taken: "Damage Taken",
        mana_spent: "Mana Spent",
        spell_casts: "Spell Casts",
        gems_won: "Gems Won",
        gems_lost: "Gems Lost",
        games_played: "Games Played",
        games_won: "Games Won",
    }
    return {
        getDescription: function (name) {
            return description[name];
        },
        getKeys: function () {
            return Object.keys(description);
        }
    }
})();

/**
 * Default building stats for each building
 * @type {{getStats: (function(*): *)}}
 */
export const buildingStats = (function (){
    const stats = {
        Altar: [
            {name: "capacity", value: 100}, // repurposed for health
        ],
        Mine: [
            {name: "capacity", value: 1000}, // max crystals
            {name: "speed", value: 1}, // crystals per second
            {name: "fortune", value: 1}, // chance of getting a gem
        ],
        Tower: [
            {name: "range", value: 5}, // range of the tower
            {name: "damage", value: 5}, // damage of the tower
            {name: "speed", value: 1}, // attack speed of the tower
            {name: "fortune", value: 1}, // chance of getting a critical hit
        ],
        FusionTable: [
            {name: "speed", value: 1}, // speed of gem fusion
            {name: "fortune", value: 1}, // chance of getting higher quality gem
        ]
    }

    return {
        getStats: function (name) {
            return stats[name] ?? [];
        }
    }
})();

/**
 * Enum for the different types of cursors
 * @type {{getNumber: (function(*): *), getSize: number, getName: (function(*): *)}}
 */
export const Cursors = (function (){
    const number = {
        "./static/assets/images/crosshairs/aim.png": 0,
        "./static/assets/images/crosshairs/cross.png": 1,
        "./static/assets/images/crosshairs/crosshairs.png": 2,
        "./static/assets/images/crosshairs/target.png": 3,
    }

    const name = {
        0: "./static/assets/images/crosshairs/aim.png",
        1: "./static/assets/images/crosshairs/cross.png",
        2: "./static/assets/images/crosshairs/crosshairs.png",
        3: "./static/assets/images/crosshairs/target.png",
    }

    return {
        getNumber: function (name) {
            return number[name];
        },
        getName: function (number) {
            return name[number];
        },
        getSize: Object.keys(number).length
    };
})();

/**
 * Enum for the different types of performance
 * @type {{getNumber: (function(*): *), getSize: number, getName: (function(*): *)}}
 */
export const Performace = (function (){
    const number = {
        "low": 0,
        "./static/assets/images/crosshairs/cross.png": 1,
        "./static/assets/images/crosshairs/crosshairs.png": 2,
    }

    const name = {
        0: "./static/assets/images/crosshairs/aim.png",
        1: "./static/assets/images/crosshairs/cross.png",
        2: "./static/assets/images/crosshairs/crosshairs.png",
    }

    return {
        getNumber: function (name) {
            return number[name];
        },
        getName: function (number) {
            return name[number];
        },
        getSize: Object.keys(number).length
    };
})();