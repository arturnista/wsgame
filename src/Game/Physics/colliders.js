function createBox(size, thickness = 0) {
    // throw new Error('Do not use the BOX Collider for now!')
    return {
        type: 'box',
        size: size,
        halfSize: size / 2,
        thickness: thickness,
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

function createCircle(size, thickness = 0) {
    return {
        type: 'circle',
        size: size,
        thickness: thickness,
        radius: size / 2
    }
}

module.exports = {
    createBox,
    createCircle
}
