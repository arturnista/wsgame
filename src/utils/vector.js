function length(vector) {
    if(vector == null) throw new Error('Vector is undefined')

    const len = Math.abs(vector.x) + Math.abs(vector.y)
    return len
}

function distance(pos1, pos2) {
    if(pos1 == null) throw new Error('Position 1 is undefined')
    if(pos2 == null) throw new Error('Position 2 is undefined')

    const dist = Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y)
    return Math.sqrt(dist)
}

function direction(pos1, pos2) {
    if(pos1 == null) throw new Error('Position 1 is undefined')
    if(pos2 == null) throw new Error('Position 2 is undefined')

    let dir = {
        x: pos2.x - pos1.x,
        y: pos2.y - pos1.y
    }
    return normalize(dir)
}

function normalize(vector) {
    if(vector == null) throw new Error('Vector is undefined')

    const tot = Math.abs(vector.x) + Math.abs(vector.y)
    return {
        x: vector.x / tot,
        y: vector.y / tot,
    }
}

module.exports = {
    direction,
    normalize,
    distance,
    length
}
