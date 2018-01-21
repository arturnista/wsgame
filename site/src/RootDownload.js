import React, { Component } from 'react'
import _ from 'lodash'
import moment from 'moment'
import RootGame from './RootGame'

import './RootDownload.css'

class RootDownload extends Component {

    constructor(props) {
        super(props)

        this.state = {
            showGame: false
        }

    }

    render() {
        if(this.state.showGame) return <RootGame />
        
        return (
            <div className='root'>
                <header className='root-header'>
                    <h1 className='root-header-title' onClick={_ => this.setState({showGame: true})}>NW game</h1>
                    <p className='root-header-subtitle'>Fucking amazing game</p>
                </header>
                <div className='root-content'>
                    <div className='root-content-game'>
                        <h2 className='root-content-game-title'>Windows version</h2>
                        <a className='root-content-game-link' href='/gamedata/windows.zip'>
                            Click to download
                        </a>
                    </div>
                    <div className='root-content-game'>
                        <h2 className='root-content-game-title'>Linux version</h2>
                        <a className='root-content-game-link' href='/gamedata/linux.zip'>
                            Click to download
                        </a>
                    </div>
                </div>
                {/* <div className='root-rooms'>

                </div> */}
                <footer className='root-footer'>
                    <h3>Author</h3>
                    <a href='https://github.com/arturnista'>Artur Morelle Nista</a>

                    <h3>Source code</h3>
                    <p>This game is open source!</p>
                    <div className='root-footer-codes'>
                        <a href='https://github.com/arturnista/wsgame'>Server</a>
                        <a href='https://github.com/arturnista/wsgame_unity'>Game</a>
                    </div>
                </footer>
            </div>
        )

    }
}

export default RootDownload
