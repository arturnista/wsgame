const _ = require('lodash')
const moment = require('moment')
const goTypes = require('./gameObjectTypes')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')
const spells = require('./spells')

function BotBehaviour(player) {
    let offensiveSpells = Object.keys(spells).filter(k => spells[k].type == 'offensive')
    let defensiveSpells = Object.keys(spells).filter(k => spells[k].type == 'defensive')

    let [ fSpell, sSpell ] = _.shuffle(offensiveSpells)
    let [ tSpell ] = _.shuffle(defensiveSpells)

    this.player = player
    this.player.spells = [ fSpell, sSpell, tSpell ]
    this.offensiveSpells = [ fSpell, sSpell ]
    this.defensiveSpells = [ tSpell ]
    
    this.lastSpell = 0
    this.spellOffset = _.random(1, 3, true)
    this.lastCheck = 0
    this.checkForProjectile = 1
}


BotBehaviour.prototype.update = function (deltatime) {
    if(this.player.positionToGo == null) {
        this.setPosition()
    }

    this.lastSpell += deltatime
    if(this.lastSpell > this.spellOffset) {
        this.lastSpell = 0
        this.spellOffset = _.random(1, 3, true)

        const spellName = _.sample(this.offensiveSpells)
        const playersToCast = this.player.goController.gameObjects.filter(x =>
            x.type === goTypes.PLAYER && x.status === 'alive' && x.id !== this.player.id
        )

        if(playersToCast.length > 0) {
            const playerToCast = playersToCast[_.random(0, playersToCast.length - 1)]
            const positionToCast = _.clone(playerToCast.position)
            this.castSpell(spellName, positionToCast)
        }
    }

    this.lastCheck += deltatime   
    if(this.lastCheck > this.checkForProjectile) {
        this.lastCheck = 0
        const spells = this.player.goController.gameObjects.filter(x => x.type === goTypes.SPELL)

        spells.forEach(sp => {
            const spellDirection = vector.direction(sp.position, this.player.position)
            const spellVelocity = vector.normalize(sp.velocity)

            const isGoing = vector.length( vector.sub( spellVelocity, spellDirection ) )
            if(isGoing < 0.5) {
                const spellName = _.sample(this.defensiveSpells)
                this.setPosition()
                if(this.canCastSpell(spellName)) {
                    this.castSpell(spellName, this.player.positionToGo)
                }
            }
        })
    }
}

BotBehaviour.prototype.setPosition = function() {

    const mapPos = this.player.mapController.currentMap.position
    const mapSize = this.player.mapController.currentMap.size / 2
    this.player.positionToGo = {
        x: _.random(mapPos.x - mapSize, mapPos.x + mapSize),
        y: _.random(mapPos.y - mapSize, mapPos.y + mapSize),
    }

}

BotBehaviour.prototype.canCastSpell = function(spellName) {
    const spellData = spells[spellName]
    return !this.player.spellsUsed[spellName] || moment().diff(this.player.spellsUsed[spellName]) >= spellData.cooldown
}

BotBehaviour.prototype.castSpell = function(spellName, positionToCast) {
    const data = {
        id: this.player.id,
        position: positionToCast,
        direction: vector.direction(this.player.position, positionToCast)
    }
    this.player.useSpell(spellName, data)
}

module.exports = BotBehaviour
