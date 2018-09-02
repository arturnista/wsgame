const functions = require('firebase-functions')
const admin = require('firebase-admin')
// INITIALIZATIONS
admin.initializeApp()

exports.createUser = functions.auth.user().onCreate(event => {
    const data = {
        id: event.uid,
        email: event.email,
        config: {
            name: event.displayName,
            hotkeys: ['Q', 'W', 'R'],
            spells: ['fireball', 'explosion', 'blink'],
        },
        badges: []
    }
    return admin.firestore().collection('/users').doc(data.id).set(data)
})

exports.deleteUser = functions.auth.user().onDelete(event => {
    return admin.firestore().collection('/users').doc(event.uid).delete()
})