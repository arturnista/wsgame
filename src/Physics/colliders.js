function createBox(size) {
    return {
        type: 'box',
        size: size,
        halfSize: size / 2
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
