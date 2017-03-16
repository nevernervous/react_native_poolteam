import React, {Component} from 'react';
import {
    Alert,
    View,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView,
    ListView,
} from 'react-native';

import {Text, Icon, List, ListItem} from 'react-native-elements';
import store from '../store';
import api from '../api';
import Logo from './common/Logo';
import {yellow600, blue900, grey300, red500, lime500} from './common/color';
import LoadingIndicator from './common/LoadingIndicator';
const { width, height } = Dimensions.get("window");

export default class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            b_loading: false,
            errorText: null,
            users: {},
        };
    }

    componentWillMount() {
        this.mounted = true;
        this.pollUsers();
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillFocus() {
        this.mounted = true;
        this.pollUsers();
    }

    pollUsers() {
        this.setState({b_loading: true});
        api.getAllUsers(store.email)
            .then(response => {
                if (!this.mounted) return;
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

    onPressUserItem(index) {
        this.mounted = false;
        this.props.navigator.push({ name: 'userdetail', user: this.state.users[index]});
    }

    renderMainContent() {
        return (
            <ScrollView>
                <List>
                    {
                        this.state.users.map((user, i) => (
                            <ListItem
                                key={i}
                                title={user.name}
                                subtitle={user.role === 'admin'? "Administrator": "Guest"}
                                leftIcon={{name: user.role === 'admin'? "star": "perm-identity", color: user.role === 'admin'? red500: lime500}}
                                onPress={() => this.onPressUserItem(i)}
                                underlayColor={grey300}
                            />
                        ))
                    }
                </List>
            </ScrollView>
        );
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
                {this.state.b_loading? <LoadingIndicator/>: this.renderMainContent()}
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
    menuButton: {
        marginLeft: 20,
    },
    headerText: {
        color: yellow600,
        paddingLeft: 10,
    },
    content: {
        marginTop: 10,
        marginHorizontal:10,
    },
});