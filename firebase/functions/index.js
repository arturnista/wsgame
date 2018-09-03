const functions = require('firebase-functions')
const admin = require('firebase-admin')
// INITIALIZATIONS
admin.initializeApp()

exports.createUser = functions.auth.user().onCreate(event => {
    console.log(event)
    const data = {
        id: event.uid,
        email: event.email,
        config: {
            name: event.displayName,
            hotkeys: ['q', 'w', 'e'],
            spells: [
                { id: 'fireball', position: 0 },
                { id: 'explosion', position: 1 },
                { id: 'blink', position: 2 }
            ],
        },
        badges: []
    }
    return admin.firestore().collection('/users').doc(data.id).set(data)
})

exports.deleteUser = functions.auth.user().onDelete(event => {
    return admin.firestore().collection('/users').doc(event.uid).delete()
})