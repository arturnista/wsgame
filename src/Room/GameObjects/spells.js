module.exports = {
    _config: {
        MAX_OFFENSIVE: 2,
        MAX_SUPPORT: 1
    },
    fireball: {
        name: 'Fireball',
        description: 'Throws a fireball that pushes your enemy.',
        type: 'offensive',
        cooldown: 1000,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.3,
        moveSpeed: 400,
    },
    follower: {
        name: 'Follower',
        description: 'Summons 3 followers, each one follows the closest player for 6 seconds.',
        type: 'offensive',
        cooldown: 14000,
        duration: 8000,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.6,
        moveSpeed: 500,
    },
    explosion: {
        name: 'Explosion',
        description: 'Cast an explosion of 50 radius. After 650ms (casting time), all players in area receives knockback.',
        type: 'offensive',
        cooldown: 3000,
        radius: 50,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.2,
        distance: 600,
        duration: 650,
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
        moveSpeed: 400,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.4,
    },
    teleportation_orb: {
        name: 'Teleportation Orb',
        description: 'Throws a magic orb that travels for 450 units. If the spell is reused with the orb alive, the player is teleported to the position of the orb.',
        type: 'offensive',
        cooldown: 5000,
        distance: 450,
        moveSpeed: 350,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.2,
    },
    bubble: {
        name: 'Bubble',
        description: 'Throws a bubble that travel for 400 units. Enemies are pulled inside and travel with the bubble.',
        type: 'offensive',
        cooldown: 5000,
        distance: 400,
        radius: 50,
        moveSpeed: 250,
    },
    prison: {
        name: 'Player prison',
        description: 'Creates a round area that players are forbidden to enter or leave.',
        type: 'support',
        distance: 130,
        radius: 80,
        cooldown: 15000,
        duration: 3000,
    },
    prison_drag: {
        name: 'Player prison [T]',
        description: 'Test spell based on prison. Instead of clicking to use the spell, drag the mouse to determine the size of the prison. Duration is based on the size.',
        type: 'support',
        distance: 200,
        cooldown: 1000,
        minRadius: 30,
        maxRadius: 200,
        baseDuration: 3000,
    },
    repel: {
        name: 'Repel',
        description: 'Pushes all spells and enemies in a 70 units area around you.',
        type: 'support',
        radius: 70,
        cooldown: 5000,
        knockbackMultiplier: .7,
        knockbackIncrement: 1,
    },
    poison_dagger: {
        name: 'Poison Dagger',
        description: 'Throws a dagger that slow down enemies by 60% for 1s. Increases the knockback, but not pushes the target.',
        type: 'support',
        cooldown: 5000,
        moveSpeed: 550,
        knockbackMultiplier: 0,
        knockbackIncrement: 1.1,
        duration: 1000,
        hitEffects: {
            moveVelocity: .4,
        }
    },
    life_drain: {
        name: 'Life Drain',
        description: 'Transform 10% of the received knockback into life.',
        type: 'support',
        cooldown: 5000,
        moveSpeed: 550,
        knockbackMultiplier: 0,
        knockbackIncrement: 1.1,
        duration: 1000,
        effects: {
            knockbackValue: 0,
            knockbackIncrement: 0,
            lifeDrain: .1,
        }
    },
    voodoo_doll: {
        name: 'Voodoo Doll',
        description: 'Creates a doll that replicate all spells that you cast.',
        type: 'support',
        cooldown: 15000,
        duration: 5000,
    },
    reflect_shield: {
        name: 'Reflect Shield',
        description: 'Protect the player for knockback and reflect some spells.',
        type: 'support',
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
        description: 'Instant teleports the player for 300 units.',
        type: 'support',
        cooldown: 5000,
        distance: 300
    },
}
