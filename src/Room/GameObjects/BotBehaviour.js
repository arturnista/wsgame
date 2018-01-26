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
    console.log(this.player.spells)
    this.lastSpell = 0
    this.spellOffset = _.random(1, 3, true)
}


BotBehaviour.prototype.update = function (deltatime) {
    if(this.player.positionToGo == null) {
        const mapPos = this.player.mapController.currentMap.position
        const mapSize = this.player.mapController.currentMap.size / 2
        this.player.positionToGo = {
            x: _.random(mapPos.x - mapSize, mapPos.x + mapSize),
            y: _.random(mapPos.y - mapSize, mapPos.y + mapSize),
        }
    }

    this.lastSpell += deltatime
    if(this.lastSpell > this.spellOffset) {
        this.lastSpell = 0
        this.spellOffset = _.random(1, 3, true)

        const spellName = this.player.spells[_.random(0, this.player.spells.length - 1)]
        const playersToCast = this.player.goController.gameObjects.filter(x =>
            x.type === goTypes.PLAYER && x.status === 'alive' && x.id !== this.player.id
        )

        if(playersToCast.length > 0) {
            const playerToCast = playersToCast[_.random(0, playersToCast.length - 1)]
            const positionToCast = _.clone(playerToCast.position)

            const data = {
                id: this.player.id,
                position: positionToCast,
                direction: vector.direction(this.player.position, positionToCast)
            }
            this.player.useSpell(spellName, data)
        }
    }
}

module.exports = BotBehaviour
