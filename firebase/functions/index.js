const functions = require('firebase-functions')
const admin = require('firebase-admin')
// INITIALIZATIONS
admin.initializeApp()

exports.createUser = functions.auth.user().onCreate(async event => {

    const data = {
        id: event.uid,
        email: event.email,
        status: {
            elo: 1000,
        },
        preferences: {
            name: event.displayName || '',
            hotkeys: ['q', 'w', 'e'],
            spells: [],
        },
        badges: []
    }
    
    await admin.firestore().collection('/users').doc(data.id).set(data)
    return data
    
})

exports.deleteUser = functions.auth.user().onDelete(async event => {
    
    await admin.firestore().collection('/users').doc(event.uid).delete()
    return event.uid

})