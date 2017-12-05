import React, { Component } from 'react'
import logo from './logo.svg'
import './Player.css'

class Player extends Component {

    constructor(props) {
        super(props)

        this.id = props.id

        this.state = {
            x: 10,
            y: 20
        }
    }

    setPosition({x, y}) {
        this.setState({x, y})
    }

    _handleKeyDown(e) {
        const keyPressed = e.key.toLowerCase()
        switch (keyPressed) {
            case 'a':
                return this.setState({ x: this.state.x - 5 })
            case 'd':
                return this.setState({ x: this.state.x + 5 })
            case 'w':
                return this.setState({ y: this.state.y - 5 })
            case 's':
                return this.setState({ y: this.state.y + 5 })

        }
    }

    render() {

        return (
            <div className='game-player'
                style={{ left: this.state.x - 5, top: this.state.y - 5 }}
                tabIndex='0' onKeyDown={this._handleKeyDown.bind(this)}
            />
        )
    }
}

export default Player
