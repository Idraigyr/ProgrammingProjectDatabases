/**
 * @file SpellConfigs.js is a file that contains the configuration for each spell on basis of the player level.
 */
//Fireball
/**
 * Returns stats of the fireball spell
 * @param level level of the spell
 * @returns {{duration: number, damage: number, cost: number, castTime: number, fallOf: number, cooldown: number, velocity: number}}
 * @constructor
 */
export const Fireball = (level) => ({
    duration: 10,
    damage: 30 + 5 * Math.min(0,level-1),
    cost: 10,
    cooldown: 1.34,
    velocity: 20,
    fallOf: 0,
    castTime: 0
});

/**
 * Returns stats of the thundercloud spell
 * @param level level of the spell
 * @returns {{duration: number, damage: number, cost: number, castTime: number, cooldown: number}}
 * @constructor
 */
export const ThunderCloud = (level) => ({
    duration: 10,
    damage: 50 + 10 * Math.min(0,level-10),
    cost: 50,
    cooldown: 15,
    castTime: 0
});

export const maxThunderClouds = Math.ceil(ThunderCloud(1).duration / ThunderCloud(1).cooldown)*2; //*2 for multiplayer

/**
 * Returns stats of the ice wall spell
 * @param level level of the spell
 * @returns {{duration: number, cost: number, castTime: number, blocks: number, width: number, cooldown: number}}
 * @constructor
 */
export const IceWall = (level) => ({
    blocks: 5,
    width: 10,
    duration: 15,
    cooldown: 22,
    cost: 25,
    castTime: 0
});

/**
 * Returns stats of the shield spell
 * @param level level of the spell
 * @returns {{duration: number, damage: number, cost: number, castTime: number, cooldown: number}}
 * @constructor
 */
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
