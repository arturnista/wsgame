module.exports = {
    PLAYER: 'gameObject/PLAYER',
    SPELL: 'gameObject/SPELL',
    OBSTACLE: 'gameObject/OBSTACLE',
    PLAYER_OBSTACLE: 'gameObject/PLAYER_OBSTACLE',
    SPELL_OBSTACLE: 'gameObject/SPELL_OBSTACLE',
    isType: function(types, compType) {
        return types.indexOf(compType) !== -1
    },
    create: function() {
        const data = []
        for (let index = 0; index < arguments.length; index++) {
            const element = arguments[index]
            data.push(element)
        }
        return data
    }
}