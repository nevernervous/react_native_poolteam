import React, {Component} from 'react';
import {
    Alert,
    View,
    StyleSheet,
    Dimensions,
    Image,
} from 'react-native';

import {Text, Icon} from 'react-native-elements';
import { Divider ,Card, Button} from 'react-native-material-design';

import store from '../store';
import api from '../api';
import Logo from './common/Logo';
import {yellow600, blue900, grey300, blue400, green800, red400} from './common/color';
import LoadingIndicator from './common/LoadingIndicator';
const { width, height } = Dimensions.get("window");

export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            b_loading: false,
            errorText: null,
            users: {},
            dlg_type: null,
            dlg_text: '',
            dlg_open_assign: false,
            dlg_open_dismiss: false,
            dlg_error: null,
            dlg_b_button: false,
            cur_user: {'name': ''},
            cur_dev: {'name': ''},
            isWorking: false,
            dlg_open_delete: false
        };
    }

    componentWillMount() {
        this.mounted = true;
        this.pollUsers();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    pollUsers() {
        this.setState({b_loading: true});
        api.getAllUsers(store.email)
            .then(response => {
                console.log(response.payload);
                if (!this.mounted) return;
                // console.log(response.payload);
                if (response.status === 304) this.setState({ errorText: null, b_loading: false});
                else {
                    this.setState({ errorText: null, b_loading: false, users: response.payload});
                }
            })
            .catch(err => {
                if (!this.mounted) return;
                this.setState({
                    errorText: err.toString(),
                    users: [],
                    b_loading: false
                })
            });
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
                <View>

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