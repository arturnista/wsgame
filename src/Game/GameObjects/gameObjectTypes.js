const gameObject = {
    PLAYER         : 0b000001,
    SPELL          : 0b000010,
    OBSTACLE       : 0b000100,
    PLAYER_OBSTACLE: 0b001000,
    SPELL_OBSTACLE : 0b010000,
    isType: function(types, compType) {
        return (types & compType) > 0
    },
    create: function() {
        let data = 0
        for (let index = 0; index < arguments.length; index++) {
            const element = arguments[index]
            data = data | element
        }
        return data
    }
}

module.exports = gameObject