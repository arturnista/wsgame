const gameObject = {
    PLAYER         : 0b000001,
    SPELL          : 0b000010,
    OBSTACLE       : 0b000100,
    PLAYER_OBSTACLE: 0b001000,
    SPELL_OBSTACLE : 0b010000,
    isType: function(types, compType) {
        return (types & compType) > 0
    },
    create: function(...types) {
        let colliderType = 0
        for (let index = 0; index < types.length; index++) {
            const element = types[index]
            colliderType = colliderType | element
        }
        return colliderType
    }
}

module.exports = gameObject