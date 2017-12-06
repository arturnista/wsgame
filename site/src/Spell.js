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

        return (
            <div className={className}
                style={{ left: this.props.position.x - 5, top: this.props.position.y - 5 }} />
        )
    }
}

export default Spell
