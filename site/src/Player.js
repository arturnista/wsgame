import React, { Component } from 'react'
import logo from './logo.svg'
import './Player.css'

class Player extends Component {

    constructor(props) {
        super(props)

        this.id = props.id
    }

    setPosition({x, y}) {
        this.setState({x, y})
    }

    render() {
        const size = this.props.collider.size
        const halfSize = this.props.collider.size / 2

        return (
            <div className='game-player'
                style={{ left: this.props.position.x - halfSize, top: this.props.position.y - halfSize, height: size, width: size }} />
        )
    }
}

export default Player
