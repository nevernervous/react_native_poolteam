import React, {Component} from 'react';
import {
    Alert,
    View,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView,
} from 'react-native';

import {
    SideMenu, List, ListItem, Text, Icon, Button,
} from 'react-native-elements';


import store from '../store';
import api from '../api';
import Logo from './common/Logo';
import {yellow600, blue900, grey300, blue400} from './common/color';
import PoolSideMenu from './common/PoolSideMenu';
import LoadingIndicator from './common/LoadingIndicator';
import PoolList from './common/PoolList';
import PopupMenu from './common/PopupMenu';
const { width, height } = Dimensions.get("window");
const HA_POLL_INTERVAL_MS = 10000;

export default class MyPool extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMenuOpen: false,
            pools: store.pools || null,
            timeoutId: null,
            errorText: null,
        };
    }

    componentWillMount() {
        console.log('MyPool mounted');
        this.mounted = true;
        this.polllPools();
    }

    componentWillUnmount() {
        console.log('MyPool unmounted');
        this.mounted = false;
        clearTimeout(this.state.timeoutId);

    }

    polllPools() {
        api.getPools()
            .then(response => {
                if(!this.mounted) return;
                const timeoutId = setTimeout(() => this.polllPools(), HA_POLL_INTERVAL_MS);
                if(response.status === 304) {
                    this.setState({timeoutId});
                }else {
                    store.pools = response.payload;
                    this.setState({
                        pools: response.payload,
                        timeoutId,
                    });
                }
            })
            .catch(err => {
               clearTimeout(this.state.timeoutId);
               if(!this.mounted) return;
               store.pools = null;
               this.setState({
                   errorText: err.toString(),
                   pools: null,
                   timeoutId: null
               });
            });
    }

    toggleMenu () {
        this.setState({
            isMenuOpen: !this.state.isMenuOpen
        });
    }

    updateMenuState(isOpen) {
        this.setState({ isMenuOpen: isOpen });
    }

    onSideMenuItemSelected(item) {
        this.setState({
            isMenuOpen: false
        });

        switch (item) {
            case 'Users':
                this.props.navigator.push({ name: 'users' });
                break;
            case 'Settings':
                this.props.navigator.push({ name: 'settings' });
                break;
            case 'Logout':
                this.props.navigator.pop();
        }
    }

    onPressPoolItem(pool) {
        this.props.navigator.push({ name: 'pool', serialNumber: pool.serialnumber});
    }

    onPressAdd() {
    }

    renderMainContent() {
        const { errorText, pools } = this.state;
        if (errorText) {
            Alert.alert('Error', errorText);
            return;
        }
        if (!pools) return <LoadingIndicator />;
        if (pools.length) return <PoolList pools={pools} onPressPoolItem={this.onPressPoolItem.bind(this)}/>;

    }

    render() {
        const sideMenu = <PoolSideMenu
            onMenuItemSelected={(item) => this.onSideMenuItemSelected(item)}
            admin = {store.role === 'admin'}
        />;
        return (
        <SideMenu
            isOpen={this.state.isMenuOpen}
            menu={sideMenu}
            onChange={(isOpen) => this.updateMenuState(isOpen)}
        >
            <View style={styles.container}>
                <Logo />
                <View style={styles.header}>
                    <Icon name='menu'
                          color={yellow600}
                          size={30}
                          onPress={() => this.toggleMenu()}
                          containerStyle={styles.menuButton}
                    />
                    {/*<Image source={require('../img/icon_pool.png')} style={styles.headerIcon} />*/}
                    <Text h4 style={styles.headerText}>My Pools</Text>
                </View>

                {this.renderMainContent()}

                <View style={styles.addButton}>
                    {
                        store.role === 'admin' ?
                            <Icon name='add'
                                  raised
                                  color='white'
                                  containerStyle={{backgroundColor:blue900}}
                                  underlayColor={blue400}
                                  onPress={() => this.onPressAdd()}
                            /> : null
                    }
                </View>

                {/*NoteticationSystem add*/}
            </View>
        </SideMenu>

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

    addButton: {
        position: 'absolute',
        top: height - 70,
        left: width - 70,
    },
    menuButton: {
        marginLeft: 20,
    }

});