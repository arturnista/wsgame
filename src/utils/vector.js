function length(vector) {
    if(vector == null) throw new Error('Vector is undefined')

    const len = Math.abs(vector.x) + Math.abs(vector.y)
    return len
}

function distance(pos1, pos2) {
    if(pos1 == null) throw new Error('Position 1 is undefined')
    if(pos2 == null) throw new Error('Position 2 is undefined')

    const dist = Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2)
    return Math.sqrt(dist)
}

function multiply(vec1, vec2) {
    if(vec1 == null) throw new Error('Vector 1 is undefined')
    if(vec2 == null) throw new Error('Vector 2 is undefined')
    if(typeof vec2 === 'number') vec2 = { x: vec2, y: vec2 }

    return {
        x: vec2.x * vec1.x,
        y: vec2.y * vec1.y
    }
}

function reverse(vec1) {
    if(vec1 == null) throw new Error('Vector 1 is undefined')

    return {
        x: vec1.x > 0 ? 1 - vec1.x : 1 + vec1.x,
        y: vec1.y > 0 ? 1 - vec1.y : 1 + vec1.y,
    }
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
    length,
    multiply,
    reverse
}
