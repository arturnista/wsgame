export function direction(pos1, pos2) {
    let dir = {
        x: pos2.x - pos1.x,
        y: pos2.y - pos1.y
    }
    return normalize(dir)
}

export function normalize(vector) {
    const tot = Math.abs(vector.x) + Math.abs(vector.y)
    return {
        x: vector.x / tot,
        y: vector.y / tot,
    }
}

export default {
    direction,
    normalize
}
