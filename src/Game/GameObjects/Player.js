const _ = require('lodash')
const uuid = require('uuid')
const goTypes = require('./gameObjectTypes')
const vector = require('../../utils/vector')
const colliders = require('../Physics/colliders')
const BotBehaviour = require('./Behaviours/BotBehaviour')
const spells = require('./spells')

function Player(opt, goController) {
    this.id = uuid.v4()
    this.type = goTypes.create(goTypes.PLAYER)

    spells.get()
    .then(result => this.SPELL_DATA = result)

    this.collider = colliders.createCircle(25)
    this.goController = goController

    this.addState = opt.addState
    this.mapController = opt.mapController

    this.freezeTime = 0

    this.maxLife = 100
    this.status = 'alive'
    this.user = opt.user
    this.color = opt.user ? opt.user.color : ''
    this.name = opt.user ? opt.user.name : ''
    this.spells = this.user ? this.user.spells.map(x => x.id) : []

    this.isBot = opt.isBot ? true : false

    this.behaviours = []
    if(this.isBot) this.behaviours.push( new BotBehaviour(this) )

    this.start()
}

Player.prototype.start = function () {
    this.moveSpeed = 200
    this.targetPosition = null

    this.position = { x: 0, y: 0 }

    this.velocity = { x: 0, y: 0 }
    this.knockbackVelocity = { x: 0, y: 0 }
    this.moveVelocity = { x: 0, y: 0 }

    this.life = this.maxLife
    this.knockbackValue = 300

    this.spellsCooldown = {}
    this.spellsUsed = this.spells.reduce((prev, curr) => Object.assign({}, prev, { [curr]: 0 }), {})
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
        spells: this.spells.map(x => ({ name: x, cd: this.spellsCooldown[x] ? this.spellsCooldown[x].toISOString() : '' }))
    }
}

Player.prototype.settargetPosition = function (position) {
    this.targetPosition = position
}

Player.prototype.dealDamage = function (damage) {
    this.life -= damage
    if(this.life <= 0) {
        this.status = 'dead'
    }
}

Player.prototype.heal = function (amount) {
    this.life += amount
    if(this.life > this.maxLife) {
        this.life = this.maxLife
    }
}

Player.prototype.knockback = function (direction, multiplier, increment) {
    let knockbackValueOriginal = this.knockbackValue * multiplier
    let knockbackValue = this.modifiers.reduce((v, m) => _.isNil(m.effects.knockbackValue) ? v : v * m.effects.knockbackValue, knockbackValueOriginal)

    let knockbackIncrement = increment
    knockbackIncrement = this.modifiers.reduce((v, m) => _.isNil(m.effects.knockbackIncrement) ? v : v * m.effects.knockbackIncrement, knockbackIncrement)

    if(knockbackValue > 0) {
        this.knockbackVelocity = vector.add(this.knockbackVelocity, vector.multiply(direction, knockbackValue))
        this.freezeTime = 0.04
    }
    if(knockbackIncrement > 0) this.knockbackValue *= knockbackIncrement

    const lifeDrainAmount = this.modifiers.reduce((v, m) => _.isNil(m.effects.lifeDrain) ? v : v + m.effects.lifeDrain, 0)
    if(lifeDrainAmount > 0) this.heal(lifeDrainAmount * knockbackValueOriginal)
}

Player.prototype.useSpell = function(spellName, data, { isReplica = false, ignoreCooldown = false } = {}) {
    const spells = this.SPELL_DATA
    
    if(this.status !== 'alive') return
    if(this.spells.indexOf(spellName) === -1) return
    if(!spells[spellName]) return

    const isSilenced = this.modifiers.find(x => x.effects.silenced)
    if(isSilenced) return

    const spellData = spells[spellName]
    if(spellName === 'teleportation_orb' && this.teleportationOrb && this.teleportationOrb.exists) spellName = 'teleportation_orb_teleport'

    const cooldown = spellData.cooldown + (spellData.incrementalCooldown ? (this.spellsUsed[spellName] - 1) * spellData.incrementalCooldown : 0)
    if(!ignoreCooldown && this.spellsCooldown[spellName] && (new Date() - this.spellsCooldown[spellName]) < cooldown) return
    this.spellsCooldown[spellName] = new Date()
    this.spellsUsed[spellName] += 1

    if(spellData.effects || spellData.afterEffects) {
        this.addModifier(spellName, spellData)
    }

    if(!isReplica && this.voodooDollEntity && this.voodooDollEntity.exists) {
        const replicatedData = _.cloneDeep(data)
        replicatedData.direction = vector.direction( this.voodooDollEntity.position, data.position )
        replicatedData.caster = this.voodooDollEntity.id
        this.useSpell(spellName, replicatedData, { isReplica: true, ignoreCooldown: true })
    }

    if(spellData.distance) {
        if(vector.distance(this.position, data.position) >= spellData.distance) {
            const dir = vector.direction(this.position, data.position)
            const angle = Math.atan2(dir.y, dir.x)
            const xProj = Math.cos(angle) * spellData.distance
            const yProj = Math.sin(angle) * spellData.distance
            data.position = vector.add(this.position, { x: xProj, y: yProj })
        }
    }
    
    let spellEntity = null
    switch (spellName) {
        case 'fireball':
            spellEntity = this.goController.createFireball(Object.assign({ caster: data.id }, data, spellData))
            break
        case 'boomerang':
            spellEntity = this.goController.createBoomerang(Object.assign({ caster: data.id }, data, spellData))
            break
        case 'poison_dagger':
            spellEntity = this.goController.createPoisonDagger(Object.assign({ caster: data.id }, data, spellData))
            break
        case 'prison':
            spellEntity = this.goController.createPrison(Object.assign({ caster: data.id }, data, spellData))
            break
        case 'bubble':
            spellEntity = this.goController.createBubble(Object.assign({ caster: data.id }, data, spellData))
            break
        case 'shotgun':
            const init = Math.floor(spellData.amount / 2)
            for (let index = -init; index <= init; index++) {
                spellEntity = this.goController.createShotgunProjectile(Object.assign({ caster: data.id, index }, data, spellData))
            }
            break
        case 'lightning_bolt':
            spellEntity = this.goController.createLightningBolt(Object.assign({ caster: data.id }, data, spellData))
            break
        case 'prison_drag':
            if(!data.finalPosition) data.finalPosition = data.position
            const size = vector.distance(data.position, data.finalPosition)
            spellEntity = this.goController.createPrison(Object.assign({ caster: data.id, size }, data, spellData))
            break
        case 'voodoo_doll':
            spellEntity = this.goController.createVoodooDoll(Object.assign({ caster: data.id }, data, spellData))
            this.voodooDollEntity = spellEntity
            break
        case 'teleportation_orb_teleport':
            if(isReplica || !this.teleportationOrb || !this.teleportationOrb.exists) break

            this.position = this.teleportationOrb.position
            this.goController.destroy(this.teleportationOrb.id)

            this.targetPosition = null
            this.moveVelocity = { x: 0, y: 0 }
            this.teleportationOrb = null
            break
        case 'teleportation_orb':
            spellEntity = this.goController.createTeleportationOrb(Object.assign({ caster: data.id }, data, spellData))
            if(!isReplica) this.teleportationOrb = spellEntity
            break
        case 'follower':
            this.goController.createFollower(Object.assign({ caster: data.id }, data, spellData))
            setTimeout(_ => this.goController.createFollower(Object.assign({ caster: data.id }, data, spellData)), 500)
            setTimeout(_ => this.goController.createFollower(Object.assign({ caster: data.id }, data, spellData)), 1000)
            break
        case 'blink':
            this.targetPosition = null
            this.moveVelocity = { x: 0, y: 0 }
            this.knockbackVelocity = vector.multiply(this.knockbackVelocity, .5)
            this.position = data.position
            break
        case 'repel':
            this.goController.gameObjects.forEach(object => {
                if(object.id === this.id) return
                if(goTypes.isType(object.type, goTypes.PLAYER) && object.status !== 'alive') return
                if(vector.distance(object.position, this.position) > (spellData.radius + object.collider.radius)) return

                const dir = vector.direction(this.position, object.position)
                if(goTypes.isType(object.type, goTypes.PLAYER)) {
                    object.knockback(
                        dir.x === 0 && dir.y === 0 ? { x: 1, y: 1 } : dir,
                        spellData.knockbackMultiplier,
                        spellData.knockbackIncrement
                    )
                } else if(goTypes.isType(object.type, goTypes.SPELL)) {
                    object.reflect(this, dir)
                }
            })
            break
        case 'explosion':
            const afterEffect = () => {
                this.goController.gameObjects.forEach(object => {
                    if(!goTypes.isType(object.type, goTypes.PLAYER) || object.status !== 'alive' || vector.distance(object.position, data.position) > (spellData.radius + object.collider.radius)) return

                    const dir = vector.direction(data.position, object.position)
                    object.knockback(
                        dir.x === 0 && dir.y === 0 ? { x: 1, y: 1 } : dir,
                        spellData.knockbackMultiplier,
                        spellData.knockbackIncrement
                    )
                })
            }
            this.addModifier(spellName, Object.assign({ afterEffect }, spellData))
            break
        // Just add the effect, nothing more
        case 'life_drain':
            break
    }
    
    if(this.addState) {
        this.addState('spell_casted', 
            Object.assign({
                spellName,
                player: this.info(),
                entity: spellEntity && spellEntity.info(),
                castData: data
            }, spellData, {
                cooldown: spellData.cooldown + (spellData.incrementalCooldown ? (this.spellsUsed[spellName] - 1) * spellData.incrementalCooldown : 0)
            })
        )
    }
}

Player.prototype.addModifier = function(name, effectData) {
    const data = {
        name,
        initial: new Date(),
        duration: effectData.duration
    }
    if(effectData.effects) data.effects = effectData.effects
    if(effectData.afterEffect) data.afterEffect = effectData.afterEffect
    this.modifiers.push(data)
}

Player.prototype.resetCooldown = function (spellName) {
    this.spellsCooldown[spellName] = null
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

    if(this.freezeTime > 0) {
        this.freezeTime -= deltatime
        this.velocity = { x: 0, y: 0 }
        return
    }

    if(this.behaviours.length > 0) this.behaviours.forEach(behaviour => behaviour.update(deltatime))

    if(this.targetPosition != null) {

        const distance = vector.distance(this.position, this.targetPosition)
        if(distance <= 5) {

            this.moveVelocity = { x: 0, y: 0 }
            this.targetPosition = null

        } else {

            let deltaX = Math.abs(this.targetPosition.x - this.position.x) / Math.abs(this.targetPosition.y - this.position.y)
            let deltaY = 1
            let deltaSum = deltaX + deltaY

            deltaX = deltaX / deltaSum
            deltaY = deltaY / deltaSum

            if(this.targetPosition.x < this.position.x) deltaX *= -1
            if(this.targetPosition.y < this.position.y) deltaY *= -1

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

    if(goTypes.isType(object.type, goTypes.OBSTACLE)) {
        this.knockbackVelocity = vector.multiply(direction, vector.length(this.knockbackVelocity))
    }

}

module.exports = Player
