/**
 * @file ViewConfigs.js is a file that contains the default configuration settings for the view
 */

/**
 * Shows default paths to the 3d models
 */
export let assetPaths = Object.freeze({
    Altar: ["./static/assets/3d-models/altar.glb",".glb"],
    Mine: ["./static/assets/3d-models/mine.glb",".glb"],
    Player: ["./static/assets/3d-models/Wizard.glb",".glb"],
    Bush: ["./static/assets/3d-models/bushes.glb",".glb"],
    FusionTable: ["./static/assets/3d-models/fusionTable.glb",".glb"],
    Tree: ["./static/assets/3d-models/tree.glb",".glb"],
    cloud: ["./static/assets/images/cloud.png",".png"],
    fire: ["./static/assets/images/fire.png",".png"],
    RitualSpell: ["./static/assets/3d-models/BuildSpell.glb",".glb"],
    iceBlock: ["./static/assets/3d-models/crystals/Crystal.glb",".glb"],
    towerTexture: ["./static/assets/textures/towerTexture.png",".png"],
    Tower: ["./static/assets/3d-models/towers/_Wizard_tower_LVL_1.fbx",".fbx"],
    SkeletonMage: ["./static/assets/3d-models/minions/Skeleton_Mage.glb",".glb"],
    SkeletonWarrior: ["./static/assets/3d-models/minions/Skeleton_Warrior.glb",".glb"],
    SkeletonMinion: ["./static/assets/3d-models/minions/Skeleton_Minion.glb",".glb"],
    SkeletonRogue: ["./static/assets/3d-models/minions/Skeleton_Rogue.glb",".glb"],
    SkeletonArrow: ["./static/assets/3d-models/weapons/Skeleton_Arrow.gltf",".gltf"],
    SkeletonCrossbow: ["./static/assets/3d-models/weapons/Skeleton_Crossbow.gltf",".gltf"],
    SkeletonBlade: ["./static/assets/3d-models/weapons/Skeleton_Blade.gltf",".gltf"],
    SkeletonAxe: ["./static/assets/3d-models/weapons/Skeleton_Axe.gltf",".gltf"],
    SkeletonStaff: ["./static/assets/3d-models/weapons/Skeleton_Staff.gltf",".gltf"],
    SkeletonShield: ["./static/assets/3d-models/weapons/Skeleton_Shield_Small_A.gltf",".gltf"],
    SkeletonTexture1: ["./static/assets/textures/skeleton_texture.png",".png"],
    WarriorHut: ["./static/assets/3d-models/warrior-hut.glb",".glb"],
    WarriorHut2: ["./static/assets/3d-models/warrior-hut-2.glb",".glb"],
    SurabanglusFont: ["./static/fonts/Surabanglus_Regular.json",".json"],
    Wall1: ["./static/assets/3d-models/wall/wall_lvl1.glb",".glb"],
    Wall2: ["./static/assets/3d-models/wall/wall_lvl2.glb",".glb"],
    Wall3: ["./static/assets/3d-models/wall/wall_lvl3.glb",".glb"],
    Wall: ["./static/assets/3d-models/wall/Wall_Alt.glb",".glb"],
});

export const buildingAssetsKeys = Object.freeze([
    "Altar",
    "Mine",
    "FusionTable",
    "WarriorHut",
    "WarriorHut2",
    "Wall",
    "Wall1",
    "Wall2",
    "Wall3",
    "Tower",
    "Bush",
    "Tree",
]);

export const charsReservedForTimer = {
    "0": 6,
    "1": 6,
    "2": 6,
    "3": 6,
    "4": 6,
    "5": 6,
    "6": 6,
    "7": 6,
    "8": 6,
    "9": 6,
    ":": 2
}

const Maxbuilders = 8;
export const minCharCount = {
    "0": charsReservedForTimer["0"]*Maxbuilders,
    "1": charsReservedForTimer["1"]*Maxbuilders,
    "2": charsReservedForTimer["2"]*Maxbuilders,
    "3": charsReservedForTimer["3"]*Maxbuilders,
    "4": charsReservedForTimer["4"]*Maxbuilders,
    "5": charsReservedForTimer["5"]*Maxbuilders,
    "6": charsReservedForTimer["6"]*Maxbuilders,
    "7": charsReservedForTimer["7"]*Maxbuilders,
    "8": charsReservedForTimer["8"]*Maxbuilders,
    "9": charsReservedForTimer["9"]*Maxbuilders,
    ":": charsReservedForTimer[":"]*Maxbuilders,
}

export const cursorImgPaths = Object.freeze({
    aim: "./static/assets/images/crosshairs/aim.png",
    cross: "./static/assets/images/crosshairs/cross.png",
    crosshairs: "./static/assets/images/crosshairs/crosshairs.png",
    target: "./static/assets/images/crosshairs/target.png",
});

export const menuPaths = Object.freeze({

});

export const gridCellSize = 10;

export const islandWidth = 15;

export const islandLength = 15;

export const displayViewBoxHelper = false;

export const shadowCasting = false;