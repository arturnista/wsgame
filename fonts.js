const fs = require('fs')
const figlet = require('figlet')

let text = ''
figlet.fontsSync().forEach(font => {
    
    text += font
    text += '\n'
    text += figlet.textSync('NW Game - 123456789', font)
    text += '\n\n'

})

fs.writeFile('./fonts', text, (err, data) => {
    if(err) console.log('erro');
    else console.log('FOISSON');
    
})