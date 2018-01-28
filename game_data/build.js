const fs = require('fs')
const updates = require('./updates.json')
const readline = require('readline')
const path = require('path')
const rl = readline.createInterface({ input: process.stdin })

let now = (new Date()).toISOString()
updates.windows[now] = []
updates.linux[now] = []

let wasUpdated = false

rl.on('line', function(line) {
    let pathfile = line.substring(3)
    if(pathfile.substring(0, 8) === 'windows/') {
        pathfile = pathfile.replace('windows/', '')
        updates.windows[now].push(pathfile)
        wasUpdated = true
    } else if(pathfile.substring(0, 6) === 'linux/') {
        pathfile = pathfile.replace('linux/', '')
        updates.linux[now].push(pathfile)
        wasUpdated = true
    }
})

rl.on('close', () => {
    if(wasUpdated) fs.writeFileSync('updates.json', JSON.stringify(updates, null, 2))
})
