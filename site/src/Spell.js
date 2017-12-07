import React, { Component } from 'react'
import logo from './logo.svg'
import './Spell.css'

class Spell extends Component {

    constructor(props) {
        super(props)

        this.id = props.id
    }

    setPosition({x, y}) {
        this.setState({x, y})
    }

    render() {
        let className = 'game-spell ' + this.props.type
        const size = this.props.collider.size
        const halfSize = this.props.collider.size / 2

        return (
            <div className={className}
                style={{ left: this.props.position.x - halfSize, top: this.props.position.y - halfSize, height: size, width: size, borderRadius: halfSize }} />
        )
    }
}

export default Spell
