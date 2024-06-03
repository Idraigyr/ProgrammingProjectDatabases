/**
 * @file SpellConfigs.js is a file that contains the configuration for each spell on basis of the player level.
 */
//Fireball
export const Fireball = (level) => ({
    duration: 10,
    damage: 30 + 5 * (level-1),
    cost: 10,
    cooldown: 1.34,
    velocity: 20,
    fallOf: 0,
    castTime: 0
});

export const ThunderCloud = (level) => ({
    duration: 10,
    damage: 50 + 10 * Math.min(0,level-10),
    cost: 50,
    cooldown: 15,
    castTime: 0
});

export const maxThunderClouds = Math.ceil(ThunderCloud(1).duration / ThunderCloud(1).cooldown)*2; //*2 for multiplayer

export const IceWall = (level) => ({
    blocks: 5,
    width: 10,
    duration: 15,
    cooldown: 22,
    cost: 25,
    castTime: 0
});

export const Shield = (level) => ({
    duration: 7,
    cooldown: 18,
    cost: 30,
    castTime: 0,
    damage: 0
});

export const Heal = (level) => ({});

export const Zap = (level) => ({});

export const BuildSpell = (level) => ({});
