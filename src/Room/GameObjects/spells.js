module.exports = {
    fireball: {
        cooldown: 1000,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.2,
        moveSpeed: 400
    },
    explosion: {
        cooldown: 3000,
        radius: 100,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.3,
        duration: 1000,
        effects: {
            moveVelocity: 0,
        }
    },
    reflect_shield: {
        cooldown: 6000,
        duration: 1000,
        effects: {
            knockbackValue: 0,
            knockbackIncrement: 0
        }
    },
    blink: {
        cooldown: 5000,
        distance: 300,
        duration: 1000,
        effects: {
            moveVelocity: 0,
        }
    },
}
