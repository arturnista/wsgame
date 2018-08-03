module.exports = {
    PLAYER: 'gameObject/PLAYER',
    SPELL: 'gameObject/SPELL',
    OBSTACLE: 'gameObject/OBSTACLE',
    isType: function(types, compType) {
        return types.indexOf(compType) !== -1
    }
}