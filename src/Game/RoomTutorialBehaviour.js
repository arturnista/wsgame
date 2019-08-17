const vector = require('../utils/vector')
const goTypes = require('./GameObjects/gameObjectTypes')
const BotBehaviour = require('./GameObjects/Behaviours/BotBehaviour')

function RoomTutorialBehaviour(room) {
    this.room = room

    this.tutorialPhase = 0
    this.messagesTimeoutIds = []

    this.player = null
    this.letGameEnd = false
}

RoomTutorialBehaviour.prototype.start = function(players) {
    this.tutorialPhase = 0
    players[0].spells = []

    const angle = Math.random() * 360
    const mapInfo = this.room.mapController.info()
    const distance = (Math.random() * (mapInfo.size / 2 - 100)) + 50
    const randomPositionInside = { x: Math.cos(angle) * distance + mapInfo.position.x, y: Math.sin(angle) * distance + mapInfo.position.y }

    const outAngle = angle + 180
    const outDistance = (mapInfo.size / 2) + 100
    const randomPositionoOutside = { x: Math.cos(outAngle) * outDistance + mapInfo.position.x, y: Math.sin(outAngle) * outDistance + mapInfo.position.y }
    
    this.movePositions = [
        { x: 250, y: 150 },
        randomPositionInside,
        randomPositionoOutside,
        { x: 250, y: 250 },
    ]
}

RoomTutorialBehaviour.prototype.update = function(deltatime) {
    if(this.tutorialPhase === 0) {
        this.tutorialPhase = 1
        this.room.addState('show_message', { messageCode: 'TUTORIAL_WELCOME', time: 5000 })
        const id = setTimeout(() => {
            this.player = this.room.gameObjectController.gameObjects.find(x => goTypes.isType(x.type, goTypes.PLAYER))
            this.baseLife = this.player.life
            this.minLife = this.player.maxLife * .1

            this.tutorialPhase = 2
            this.room.addState('show_message', { messageCode: 'TUTORIAL_MOVING' })
            this.room.addState('show_position', { position: this.movePositions[0] })
        }, 5000)

        this.messagesTimeoutIds.push(id)
    } else if(this.tutorialPhase === 2) {
        const dist = vector.distance(this.player.position, this.movePositions[0])
        if(dist < 15) {
            this.room.addState('show_message', { messageCode: 'TUTORIAL_MOVING_2' })
            this.room.addState('show_position', { position: this.movePositions[1] })
            this.tutorialPhase = 3
        }
    } else if(this.tutorialPhase === 3) {
        const dist = vector.distance(this.player.position, this.movePositions[1])
        if(dist < 15) {
            this.room.addState('show_message', { messageCode: 'TUTORIAL_MOVING_3' })
            this.room.addState('show_position', { position: this.movePositions[2] })
            this.tutorialPhase = 4
        }
    } else if(this.tutorialPhase === 4) {
        if(this.player.life < this.baseLife) {
            this.room.addState('show_message', { messageCode: 'TUTORIAL_SAFETY', time: 5000 })
            this.room.addState('show_position', { position: this.movePositions[3] })
            this.tutorialPhase = 5
            const damageId = setTimeout(() => {
                this.room.addState('show_message', { messageCode: 'TUTORIAL_DAMAGE_EXPLAIN', time: 5000 })
                this.room.addState('show_position', { destroy: true })
                this.tutorialPhase = 6

                const playerId = setTimeout(() => {
                    this.room.addState('show_message', { messageCode: 'TUTORIAL_PLAYER', time: 8000 })
                    this.botPlayer = this.room.gameObjectController.createPlayer({ isBot: false, addState: this.room.addState.bind(this.room), mapController: this.room.mapController })
                    this.botKnockbackBase = this.botPlayer.knockbackValue
                    this.botLifeBase = this.botPlayer.life
                    this.botPlayer.spells = []
                    this.botPlayer.position.x = 250
                    this.botPlayer.position.y = 350
                    this.botPlayer.color = '#FF6F00'
                    this.botPlayer.name = 'Tutorial Bot'
                    
                    this.room.gameObjectController.create(this.botPlayer)
                    this.tutorialPhase = 7
                    const spellId = setTimeout(() => {
                        this.room.addState('show_message', { messageCode: 'TUTORIAL_SPELL' })
                        this.room.addState('show_spell_position', { position: this.botPlayer.position })

                        this.player.spells = ['fireball']
                        this.room.addState('player_add_spell', { spellName: 'fireball' })

                        this.tutorialPhase = 8
                    }, 5000)
                    this.messagesTimeoutIds.push(spellId)
                }, 5000)
                this.messagesTimeoutIds.push(playerId)
            }, 5000)
            this.messagesTimeoutIds.push(damageId)

        } 
    } else if(this.tutorialPhase === 8) {
        if(this.botPlayer.knockbackValue > this.botKnockbackBase) {

            this.room.addState('show_message', { messageCode: 'TUTORIAL_SPELL_HIT' })
            this.room.addState('show_spell_position', { destroy: true })

            this.tutorialPhase = 9
        }
        
    } else if(this.tutorialPhase === 9) {
        if(this.botPlayer.life < this.botLifeBase) {

            this.room.addState('show_message', { messageCode: 'TUTORIAL_KILL' })
            this.botPlayer.behaviours.push( new BotBehaviour(this.botPlayer) )
            this.botPlayer.spells = []
            this.botPlayer.life = 30

            this.tutorialPhase = 10

            this.letGameEnd = true
        }
    }

    if(this.player && this.player.life < this.minLife) this.player.life = this.player.maxLife

    return {
        ignoreEndGame: !this.letGameEnd
    }
}

RoomTutorialBehaviour.prototype.delete = function() {
    this.messagesTimeoutIds.forEach(clearTimeout)
}

module.exports = RoomTutorialBehaviour