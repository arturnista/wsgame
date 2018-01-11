module.exports = {
    _config: {
        MAX_OFFENSIVE: 2,
        MAX_DEFENSIVE: 1
    },
    fireball: {
        _type: 'offensive',
        cooldown: 1000,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.2,
        moveSpeed: 400
    },
    follower: {
        _type: 'offensive',
        cooldown: 10000,
        knockbackMultiplier: 1.3,
        knockbackIncrement: 1.5,
        moveSpeed: 500
    },
    explosion: {
        _type: 'offensive',
        cooldown: 3000,
        radius: 100,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.3,
        duration: 1000,
        effects: {
            moveVelocity: 0,
            silenced: true
        }
    },
    reflect_shield: {
        _type: 'defensive',
        cooldown: 6000,
        duration: 1000,
        effects: {
            knockbackValue: 0,
            knockbackIncrement: 0,
            reflectSpells: true
        }
    },
    blink: {
        _type: 'defensive',
        cooldown: 5000,
        distance: 300,
        duration: 1000,
        effects: {
            moveVelocity: 0,
            silenced: true
        }
    },
}
