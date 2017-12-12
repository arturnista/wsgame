function createBox(size) {
    throw new Error('Do not use the BOX Collider for now!')
    return {
        type: 'box',
        size: size,
        halfSize: size / 2,
        edges: function(position) {
            return {
                min: {
                    x: position.x - this.halfSize,
                    y: position.y - this.halfSize
                },
                max: {
                    x: position.x + this.halfSize,
                    y: position.y + this.halfSize
                }
            }
        }
    }
}

function createCircle(size) {
    return {
        type: 'circle',
        size: size,
        radius: size / 2
    }
}

module.exports = {
    createBox,
    createCircle
}
