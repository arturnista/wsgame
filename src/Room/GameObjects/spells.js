module.exports = {
    fireball: {
        cooldown: 1000,
        multiplier: 1,
        adder: 1.2,
        moveSpeed: 400
    },
    explosion: {
        cooldown: 3000,
        radius: 100,
        multiplier: 1,
        adder: 1.3,
    },
    reflect_shield: {
        cooldown: 6000,
        duration: 1000,
        effects: {
            knockback: 0,
            knockbackAdder: 0
        }
    },
    blink: {
        cooldown: 5000,
        distance: 300,
        duration: 1000,
        effects: {
            velocity: 0,
        }
    },
}
