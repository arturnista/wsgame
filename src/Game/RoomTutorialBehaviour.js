const vector = require('../utils/vector')
const goTypes = require('./GameObjects/gameObjectTypes')

function RoomTutorialBehaviour(room) {
    this.room = room

    this.tutorialPhase = 0
    this.movePositions = [
        { x: 250, y: 250 },
        { x: 200, y: 350 },
        { x: 600, y: 0 },
        { x: 250, y: 250 },
    ]
    this.player = null
}

RoomTutorialBehaviour.prototype.start = function() {
    this.tutorialPhase = 0
}

RoomTutorialBehaviour.prototype.update = function(deltatime) {
    if(this.tutorialPhase === 0) {
        this.tutorialPhase = 1
        this.room.addState('show_message', { message: 'Welcome to NW Game! This tutorial will help you start playing!', time: 5000 })
        setTimeout(() => {
            this.player = this.room.gameObjectController.gameObjects.find(x => goTypes.isType(x.type, goTypes.PLAYER))
            this.baseLife = this.player.life
            this.minLife = this.player.maxLife * .1

            this.tutorialPhase = 2
            this.room.addState('show_message', { message: 'You can move around using the right mouse button. Try moving there!', time: 5000 })
            this.room.addState('show_position', { position: this.movePositions[0] })
        }, 5000)
    } else if(this.tutorialPhase === 2) {
        const dist = vector.distance(this.player.position, this.movePositions[0])
        if(dist < 15) {
            this.room.addState('show_message', { message: 'Now there', time: 5000 })
            this.room.addState('show_position', { position: this.movePositions[1] })
            this.tutorialPhase = 3
        }
    } else if(this.tutorialPhase === 3) {
        const dist = vector.distance(this.player.position, this.movePositions[1])
        if(dist < 15) {
            this.room.addState('show_message', { message: 'Ok, last time!', time: 5000 })
            this.room.addState('show_position', { position: this.movePositions[2] })
            this.tutorialPhase = 4
        }
    } else if(this.tutorialPhase === 4) {
        if(this.player.life < this.baseLife) {
            this.room.addState('show_message', { message: 'That was a mistake, sorry! You should get back to safety.', time: 8000 })
            this.room.addState('show_position', { position: this.movePositions[3] })
            this.tutorialPhase = 5
            setTimeout(() => {
                this.room.addState('show_message', { message: 'When you leave the arena, you take damage over time!', time: 8000 })
                this.tutorialPhase = 6
            }, 8000)
        }
    }

    if(this.player && this.player.life < this.minLife) this.player.life = this.player.maxLife

    return {
        ignoreEndGame: true
    }
}

module.exports = RoomTutorialBehaviour