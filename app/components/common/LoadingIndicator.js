import React, {Component} from 'react';
import {ActivityIndicator, Dimensions, StyleSheet} from 'react-native';
import {blue900} from './color';
const { width, height } = Dimensions.get("window");
export default class LoadingIndicator extends Component {
    render() {
        return (
            <ActivityIndicator
                animating={this.props.show}
                size="large"
                style={this.props.center ? styles.waitIcon : null}
                color={blue900}
            />
        );
    }
}

LoadingIndicator.defaultProps = {
    center: true,
};

const styles = StyleSheet.create({
    waitIcon: {
        position: 'absolute',
        top: height / 2 - 10,
        left: width /2 - 10,
    },
});

