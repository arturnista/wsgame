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
        let classNames = 'game-player '
        classNames = this.props.modifiers.reduce((v, m) => v + m + ' ', classNames)
        return (
            <div className={classNames}
                style={{ backgroundColor: this.props.color, left: this.props.position.x - halfSize, top: this.props.position.y - halfSize, height: size, width: size, borderRadius: halfSize }} />
        )
    }
}

export default Player
