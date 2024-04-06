export const buildTypes = (function (){
    const number = {
        void: 0,
        empty: 1,
        bridge: 2,
        altar_building: 3,
        mine_building: 4,
        tower_building: 5,
        prop: 6,
        fuse_table: 7
    };
    const name = {
        0: "void",
        1: "empty",
        2: "bridge",
        3: "altar_building",
        4: "mine_building",
        5: "tower_building",
        6: "prop",
        7: "fuse_table"
    }

    const menuName = {
        1: "BuildMenu",
        3: "AltarMenu",
        7: "FusionTableMenu",
        5: "TowerMenu",
        4: "MineMenu"
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