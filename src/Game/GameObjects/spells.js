const database = require('../../Database').getDatabase()
const package = require('../../../package.json')

const staticSpells = {
    _config: {
        MAX_OFFENSIVE: 2,
        MAX_SUPPORT: 1
    },
    fireball: {
        name: 'Fireball',
        description: 'Throws a fireball that pushes your enemy.',
        type: 'offensive',
        cooldown: 1000,
        knockbackMultiplier: .8,
        knockbackIncrement: 1.1,
        moveSpeed: 400,
    },
    follower: {
        name: 'Follower',
        description: 'Summons 3 followers, each one follows the closest player for 6 seconds.',
        type: 'offensive',
        cooldown: 12000,
        duration: 8000,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.6,
        moveSpeed: 500,
    },
    explosion: {
        name: 'Explosion',
        description: 'Cast an explosion of 60 radius. After 600ms (casting time), all players in area receives knockback.',
        type: 'offensive',
        cooldown: 2500,
        radius: 60,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.4,
        distance: 700,
        duration: 600,
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
        moveSpeed: 550,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.4,
    },
    teleportation_orb: {
        name: 'Teleportation Orb',
        description: 'Throws a magic orb that travels for 450 units. If the spell is reused with the orb alive, the player is teleported to the position of the orb.',
        type: 'offensive',
        cooldown: 4500,
        distance: 450,
        moveSpeed: 350,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.5,
    },
    bubble: {
        name: 'Bubble',
        description: 'Throws a bubble that travel for 500 units. Enemies are pulled inside and travel with the bubble.',
        type: 'offensive',
        cooldown: 3000,
        distance: 500,
        radius: 50,
        moveSpeed: 250,
    },
    lightning_bolt: {
        name: 'Lightning Bolt',
        description: 'Fast eletric projectile. Pushes enemies and stun nearby enemies.',
        type: 'offensive',
        cooldown: 4000,
        moveSpeed: 700,
        radius: 70,
        duration: 750,
        knockbackMultiplier: 1,
        knockbackIncrement: 1.4,
        hitEffects: {
            moveVelocity: 0,
            silenced: true
        }
    },
    shotgun: {
        name: 'Shotgun',
        description: 'Fire 3 shots that pushes enemies.',
        type: 'offensive',
        cooldown: 3000,
        moveSpeed: 450,
        amount: 3,
        knockbackMultiplier: .4,
        knockbackIncrement: 1.1,
    },
    prison: {
        name: 'Player prison',
        description: 'Creates a round area that players are forbidden to enter or leave.',
        type: 'support',
        cooldown: 7000,
        distance: 140,
        radius: 45,
        duration: 3000,
    },
    repel: {
        name: 'Repel',
        description: 'Pushes all spells and enemies in a 100 units area around you.',
        type: 'support',
        cooldown: 5000,
        radius: 100,
        knockbackMultiplier: .7,
        knockbackIncrement: 1,
    },
    poison_dagger: {
        name: 'Poison Dagger',
        description: 'Throws a fast dagger that slow down enemies by 60% for 5s. Increases the knockback, but not pushes the target.',
        type: 'support',
        cooldown: 5000,
        moveSpeed: 750,
        knockbackMultiplier: 0,
        knockbackIncrement: 1.1,
        duration: 5000,
        hitEffects: {
            moveVelocity: .4,
        }
    },
    life_drain: {
        name: 'Life Drain',
        description: 'Transform 10% of the received knockback into life.',
        type: 'support',
        cooldown: 5000,
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
        cooldown: 14000,
        duration: 7000,
    },
    reflect_shield: {
        name: 'Reflect Shield',
        description: 'Protect the player for knockback and reflect some spells.',
        type: 'support',
        cooldown: 5000,
        duration: 2500,
        effects: {
            knockbackValue: 0,
            knockbackIncrement: 0,
            reflectSpells: true
        }
    },
    blink: {
        name: 'Blink',
        description: 'Instant teleports the player for 250 units. Each use increment the cooldown in 5s.',
        type: 'support',
        cooldown: 5000,
        incrementalCooldown: 5000,
        distance: 250
    },
}

// database.collection('/spells').doc(package.version).set(staticSpells)

module.exports = staticSpells
module.exports.get = () => {
    // return database.collection('/spells').doc(package.version).get()
    // .then(result => result.data())

    return Promise.resolve(staticSpells)
}
