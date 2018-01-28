var http = require('http')
var fs = require('fs')
const path = require('path')

const serverUrl = `http://tutuonline.herokuapp.com`
const platform = 'linux'
const filesUrl = `${serverUrl}/gamedata/${platform}`

function mkDirByPathSync(targetDir, sep = path.sep) {
    const initDir = path.isAbsolute(targetDir) ? sep : ''
    const baseDir = __dirname

    targetDir.split(sep).reduce((parentDir, childDir) => {
        const curDir = path.resolve(baseDir, parentDir, childDir)
        try {
            fs.mkdirSync(curDir)
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
        return curDir
    }, initDir)
}

function downloadFile(filename) {
    const url = filesUrl + '/' + filename
    const pathfile = path.parse(filename)

    mkDirByPathSync(pathfile.dir, '/')

    const file = fs.createWriteStream(filename)
    const request = http.get(url, function(response) {
        response.pipe(file)
    })
}

function get(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            res.setEncoding("utf8")
            let body = ""
            res.on("data", data => {
                body += data
            })
            res.on("end", () => {
                resolve(JSON.parse(body))
            })
        })
    })
}

get(serverUrl + '/game/updates')
.then(data => {
    let lastUpdate = ''
    try {
        let metaData = fs.readFileSync('meta', 'utf8')
        metaData = JSON.parse(metaData)
        lastUpdate = metaData.lastUpdate
    } catch (e) {
        if(e.code === 'ENOENT') lastUpdate = 'first'
        else throw e
    }
    const pUpdates = data[platform]
    let files = []
    if(lastUpdate === 'first') {
        files = pUpdates.first
    } else {
        Object.keys(pUpdates).forEach(date => {
            if(date === 'first') return
            const today = new Date()
            const updDate = new Date(date)
            if(updDate - today < 0) return

            files = files.concat(pUpdates[date])
        })
    }
    files = files.filter((v,i) => files.indexOf(v) === i)
    console.log(files)


    for (var i = 0; i < files.length; i++) downloadFile(files[i])

    const f = { lastUpdate: (new Date()).toISOString() }
    fs.writeFileSync('meta', JSON.stringify(f))
})
.catch(e => {
    console.log('ERRO NO DOWNLOAD')
    console.log(e)
})
