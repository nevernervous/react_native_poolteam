import React, {Component} from 'react';
import {
    Alert,
    View,
    StyleSheet,
    Dimensions,
} from 'react-native';

import {Text, Icon} from 'react-native-elements';
import { Divider } from 'react-native-material-design';

import store from '../store';
import api from '../api';
import Logo from './common/Logo';
import {yellow600, blue900, grey300, blue400, green800, red400} from './common/color';
import LoadingIndicator from './common/LoadingIndicator';
const { width, height } = Dimensions.get("window");

export default class Users extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {

    }

    componentWillUnmount() {
    }

    render() {
        return (
            <View style={styles.container}>
                <Logo />
                <View style={styles.header}>
                    <Icon name='arrow-back'
                          color={yellow600}
                          size={30}
                          containerStyle={styles.menuButton}
                          onPress={() => this.props.navigator.pop()}
                    />
                    <Text h4 style={styles.headerText}>Users</Text>
                </View>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: grey300,

    },
    header: {
        flexDirection: 'row',
        backgroundColor: blue900,
        height: 50,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    headerIcon: {
        width: 30,
        height: 30,
        marginLeft:10,
    },
    headerText: {
        color: yellow600,
        paddingLeft: 10,
    },
});