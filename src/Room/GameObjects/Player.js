const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')
const BotBehaviour = require('./BotBehaviour')
const spells = require('./spells')

function Player(opt, goController) {
    this.id = uuid.v4()
    this.type = goTypes.PLAYER

    this.collider = colliders.createCircle(25)
    this.goController = goController

    this.addState = opt.addState
    this.mapController = opt.mapController

    this.status = 'alive'
    this.name = ''
    this.color = ''
    this.start()

    this.botBehaviour = null
    if(opt.isBot) this.botBehaviour = new BotBehaviour(this)
}

Player.prototype.start = function () {
    this.moveSpeed = 200
    this.positionToGo = null

    this.position = { x: 0, y: 0 }

    this.velocity = { x: 0, y: 0 }
    this.knockbackVelocity = { x: 0, y: 0 }
    this.moveVelocity = { x: 0, y: 0 }

    this.life = 100
    this.knockbackValue = 300

    this.spells = []
    this.spellsUsed = {}
    this.modifiers = []
    
    this.status = 'alive'    
}

Player.prototype.restart = function () {
    this.start()
}

Player.prototype.info = function () {
    return {
        id: this.id,
        type: 'player',
        life: this.life,
        name: this.name,
        position: this.position,
        collider: this.collider,
        velocity: this.velocity,
        status: this.status,
        knockbackValue: this.knockbackValue,
        color: this.color,
        userId: this.user ? this.user.id : '',
        modifiers: this.modifiers.map(x => x.name),
        spells: this.spells.map(x => ({ name: x, cd: this.spellsUsed[x] ? this.spellsUsed[x].toISOString() : '' }))
    }
}

Player.prototype.setPositionToGo = function (position) {
    this.positionToGo = position
}

Player.prototype.dealDamage = function (damage) {
    this.life -= damage
    if(this.life <= 0) {
        this.status = 'dead'
    }
}

Player.prototype.knockback = function (direction, multiplier, increment) {
    let knockbackValue = this.knockbackValue * multiplier
    knockbackValue = this.modifiers.reduce((v, m) => _.isNil(m.effects.knockbackValue) ? v : v * m.effects.knockbackValue, knockbackValue)

    let knockbackIncrement = increment
    knockbackIncrement = this.modifiers.reduce((v, m) => _.isNil(m.effects.knockbackIncrement) ? v : v * m.effects.knockbackIncrement, knockbackIncrement)

    if(knockbackValue) this.knockbackVelocity = vector.add(this.knockbackVelocity, vector.multiply(direction, knockbackValue))
    if(knockbackIncrement) this.knockbackValue *= knockbackIncrement
}

Player.prototype.useSpell = function(spellName, data) {
    if(this.status !== 'alive') return
    if(this.spells.indexOf(spellName) === -1) return
    if(!spells[spellName]) return

    const isSilenced = this.modifiers.find(x => x.effects.silenced)
    if(isSilenced) return

    const spellData = spells[spellName]
    if(this.spellsUsed[spellName] && (new Date() - this.spellsUsed[spellName]) < spellData.cooldown) {
        if(spellName !== 'teleportation_orb' || !this.teleportationOrb || !this.teleportationOrb.exists) return
    }
    this.spellsUsed[spellName] = new Date()

    if(spellData.effects || spellData.afterEffects) {
        this.modifiers.push(Object.assign({ name: spellName, initial: new Date() }, spellData))
    }

    let spellEntity = null
    switch (spellName) {
        case 'fireball':
            spellEntity = this.goController.createFireball(Object.assign(data, spellData))
            break
        case 'boomerang':
            spellEntity = this.goController.createBoomerang(Object.assign(data, spellData))
            break
        case 'teleportation_orb':
            if(this.teleportationOrb && this.teleportationOrb.exists) {
                this.position = this.teleportationOrb.position
                this.goController.destroy(this.teleportationOrb.id)

                this.positionToGo = null
                this.moveVelocity = { x: 0, y: 0 }
                this.teleportationOrb = null
            } else {
                this.teleportationOrb = this.goController.createTeleportationOrb(Object.assign(data, spellData))
                spellEntity = this.teleportationOrb
            }
            break
        case 'follower':
            this.goController.createFollower(Object.assign(data, spellData))
            setTimeout(_ => this.goController.createFollower(Object.assign(data, spellData)), 500)
            setTimeout(_ => this.goController.createFollower(Object.assign(data, spellData)), 1000)
            break
        case 'blink':
            this.positionToGo = null
            this.moveVelocity = { x: 0, y: 0 }
            this.knockbackVelocity = vector.multiply(this.knockbackVelocity, .5)
            if(vector.distance(this.position, data.position) >= spellData.distance) {
                const dir = vector.direction(this.position, data.position)
                const angle = Math.atan2(dir.y, dir.x)
                const xProj = Math.cos(angle) * spellData.distance
                const yProj = Math.sin(angle) * spellData.distance
                this.position = vector.add(this.position, { x: xProj, y: yProj })
            } else {
                this.position = data.position
            }
            break
        case 'repel':
            this.goController.gameObjects.forEach(object => {
                if(object.id === this.id) return
                if(object.type === goTypes.PLAYER && object.status !== 'alive') return
                if(vector.distance(object.position, this.position) > (spellData.radius + object.collider.radius)) return

                const dir = vector.direction(this.position, object.position)
                console.log(object.type)
                if(object.type === goTypes.PLAYER) {
                    object.knockback(
                        dir.x === 0 && dir.y === 0 ? { x: 1, y: 1 } : dir,
                        spellData.knockbackMultiplier,
                        spellData.knockbackIncrement
                    )
                } else if(object.type === goTypes.SPELL) {
                    object.reflect(this, dir)
                }
            })
            break
        case 'explosion':
            if(vector.distance(this.position, data.position) >= spellData.distance) {
                const dir = vector.direction(this.position, data.position)
                const angle = Math.atan2(dir.y, dir.x)
                const xProj = Math.cos(angle) * spellData.distance
                const yProj = Math.sin(angle) * spellData.distance
                data.position = vector.add(this.position, { x: xProj, y: yProj })
            } else {
                data.position = data.position
            }

            const afterEffect = () => {
                this.goController.gameObjects.forEach(object => {
                    if(object.type !== goTypes.PLAYER || object.status !== 'alive' || vector.distance(object.position, data.position) > (spellData.radius + object.collider.radius)) return

                    const dir = vector.direction(data.position, object.position)
                    object.knockback(
                        dir.x === 0 && dir.y === 0 ? { x: 1, y: 1 } : dir,
                        spellData.knockbackMultiplier,
                        spellData.knockbackIncrement
                    )
                })
            }
            this.modifiers.push(Object.assign({ name: spellName, initial: new Date(), afterEffect }, spellData))
            break
    }
    
    if(this.addState) {
        this.addState('spell_casted', 
            Object.assign({
                spellName,
                player: this.info(),
                entity: spellEntity && spellEntity.info(),
                castData: data
            }, spellData)
        )
    }
}

Player.prototype.resetCooldown = function (spellName) {
    this.spellsUsed[spellName] = null
}

Player.prototype.update = function (deltatime) {
    if(this.status === 'dead') {
        this.velocity = { x: 0, y: 0 }
        return
    }

    this.modifiers = this.modifiers.filter(m => {
        if((new Date() - m.initial) > m.duration) {
            if(m.afterEffect) m.afterEffect()
            return false
        }
        return true
    })


    if(this.botBehaviour) this.botBehaviour.update(deltatime)

    if(this.positionToGo != null) {

        const distance = vector.distance(this.position, this.positionToGo)
        if(distance <= 2) {

            this.moveVelocity = { x: 0, y: 0 }
            this.positionToGo = null

        } else {

            let deltaX = Math.abs(this.positionToGo.x - this.position.x) / Math.abs(this.positionToGo.y - this.position.y)
            let deltaY = 1
            let deltaSum = deltaX + deltaY

            deltaX = deltaX / deltaSum
            deltaY = deltaY / deltaSum

            if(this.positionToGo.x < this.position.x) deltaX *= -1
            if(this.positionToGo.y < this.position.y) deltaY *= -1

            this.moveVelocity = {
                x: this.moveSpeed * deltaX,
                y: this.moveSpeed * deltaY,
            }

        }

    }

    if(vector.length(this.knockbackVelocity) > 0) {
        this.knockbackVelocity = vector.reduceToZero(this.knockbackVelocity, 300 * deltatime)
    }

    this.moveVelocity = this.modifiers.reduce((p, v) => _.isNil(v.effects.moveVelocity) ? p : vector.multiply(p, v.effects.moveVelocity), this.moveVelocity)

    this.velocity = vector.add(this.moveVelocity, this.knockbackVelocity)
}

Player.prototype.onCollide = function (object, direction, directionInv) {
    const { gameObjects } = this.goController

    if(object.id === this.id) return

    if(object.type === goTypes.OBSTACLE) {
        this.knockbackVelocity = vector.multiply(direction, vector.length(this.knockbackVelocity))
    }

}

module.exports = Player
