import React from 'react'
import {
    View,
    Text,
    Dimensions,
    TouchableHighlight
} from 'react-native';

import Style from './style';

class Cell extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Text style={[Style.cell, Style.contentCell, this.props.style]}>
                {this.props.label}
            </Text>
        );
    }
}

Cell.propTypes = {
    label: React.PropTypes.string.isRequired,
    style: React.PropTypes.any,
}


export default Cell;