function createBox(size) {
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
