import React, { Component } from 'react'
import logo from './logo.svg'
import Player from './Player'

import './Root.css'

class Root extends Component {

    constructor(props) {
        super(props)

        this.playerOne = null
        this.playerTwo = null
        this.playerThree = null

        this.mousePosition = {}

        window.socket.onopen = (ws) => {
            console.log('WEB-SOCKET :: Type: open')
            window.socket.send(JSON.stringify({type: 'ready'}))
        }

        window.socket.onmessage = (message) => {
            var body = JSON.parse(message.data)

            switch(body.type) {
                case 'ready':
                    console.log('WEB-SOCKET :: Type: ready')
                case 'sync':
                    body.players.map(player => {
                        if(player.id == '1') this.playerOne.setPosition(player.position)
                        if(player.id == '2') this.playerTwo.setPosition(player.position)
                        if(player.id == '3') this.playerThree.setPosition(player.position)
                    })
                    break
                default:
                    console.log('WEB-SOCKET :: Type: ?? => Body: ', body)
            }
        }

        window.socket.onclose = function() {
            console.log('WEB-SOCKET => Type: close')
        }

    }

    render() {
        return (
            <div className='root'>
                <header className='root-header'>
                    <img src={logo} className='root-logo' alt='logo' />
                    <h1 className='root-title'>Welcome to React</h1>
                </header>
                <div className='game-container' tabIndex='1'
                    onMouseMove={e => this.mousePosition = { x: e.pageX, y: e.pageY - 190 } }
                    onMouseDown={() => {
                        window.socket.send(JSON.stringify({
                           type: 'move',
                           id: this.playerOne.id,
                           position: this.mousePosition
                       }))
                    }}>
                    <Player id='1' ref={r => this.playerOne = r}/>
                    <Player id='2' ref={r => this.playerTwo = r}/>
                    <Player id='3' ref={r => this.playerThree = r}/>
                </div>
            </div>
        )
    }
}

export default Root
