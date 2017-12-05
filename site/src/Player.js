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

        return (
            <div className='game-player'
                style={{ left: this.props.position.x - 5, top: this.props.position.y - 5 }} />
        )
    }
}

export default Player
