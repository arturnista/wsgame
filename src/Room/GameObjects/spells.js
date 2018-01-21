module.exports = {
    _config: {
        MAX_OFFENSIVE: 2,
        MAX_DEFENSIVE: 1
    },
    fireball: {
        name: 'Fireball',
        description: 'Throws a fireball that pushes your enemy.',
        type: 'offensive',
        cooldown: 1000,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.2,
        moveSpeed: 400,
    },
    follower: {
        name: 'Follower',
        description: 'Summons 3 followers, each one follows the closest player for 10 seconds.',
        type: 'offensive',
        cooldown: 10000,
        knockbackMultiplier: 1.3,
        knockbackIncrement: 1.5,
        moveSpeed: 500,
    },
    explosion: {
        name: 'Explosion',
        description: 'Cast an explosion of 120 radius. After 1s (casting time), all players in area receives knockback.',
        type: 'offensive',
        cooldown: 3000,
        radius: 120,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.3,
        duration: 1000,
        effects: {
            moveVelocity: 0,
            silenced: true
        }
    },
    boomerang: {
        name: 'Boomerang',
        description: 'Throws a boomerang that travels for 350 units. After that, it come back to the original owner. If it hits a target or the player catch the boomerang, the cooldown is reseted.',
        type: 'offensive',
        cooldown: 5000,
        distance: 350,
        moveSpeed: 250,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.2,
    },
    reflect_shield: {
        name: 'Reflect Shield',
        description: 'Protect the player for knockback and reflect some spells.',
        type: 'defensive',
        cooldown: 6000,
        duration: 1000,
        effects: {
            knockbackValue: 0,
            knockbackIncrement: 0,
            reflectSpells: true
        }
    },
    blink: {
        name: 'Blink',
        description: 'Instant teleports the player for 300 units. After the blink, the player gets stunned for 1s.',
        type: 'defensive',
        cooldown: 5000,
        distance: 300,
        duration: 1000,
        effects: {
            moveVelocity: 0,
            silenced: true
        }
    },
}
