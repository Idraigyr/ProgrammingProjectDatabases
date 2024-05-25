//Fireball
export const fireball = (level) => ({
    duration: 10,
    damage: 30 + 5 * (level-1),
    cost: 10,
    cooldown: 1.34,
    velocity: 20,
    fallOf: 0,
    castTime: 0
});

export const thunderCloud = (level) => ({
    duration: 10,
    damage: 50 + 10 * Math.min(0,level-10),
    cost: 50,
    cooldown: 10,
    castTime: 0
});

export const iceWall = {
    blocks: 5,
    width: 10,
    duration: 15,
    cooldown: 22,
    cost: 25,
    castTime: 0
}

export const Shield = {
    duration: 7,
    cooldown: 18,
    cost: 30,
    castTime: 0
}
