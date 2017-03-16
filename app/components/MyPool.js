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
    SideMenu, Text, Icon, Button, FormLabel, FormInput,
} from 'react-native-elements';
import Modal from 'react-native-modalbox';


import store from '../store';
import api from '../api';
import Logo from './common/Logo';
import {yellow600, blue900, grey300, blue400} from './common/color';
import PoolSideMenu from './common/PoolSideMenu';
import LoadingIndicator from './common/LoadingIndicator';
import PoolList from './common/PoolList';
const { width, height } = Dimensions.get("window");
const HA_POLL_INTERVAL_MS = 1000;

export default class MyPool extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMenuOpen: false,
            pools: store.pools || null,
            timeoutId: null,
            // errorText: null,
            new_device_name: '',
            new_device_sn: '',
            delete_modal_text: '',
            edit_modal_text: '',
            selected_pool: null,
        };
    }

    componentWillMount() {
        this.mounted = true;
        this.pollPools();
    }

    componentWillUnmount() {
        this.mounted = false;
        clearTimeout(this.state.timeoutId);

    }

    componentWillFocus() {
        this.mounted = true;
        this.pollPools();
    }

    pollPools() {
        api.getPools()
            .then(response => {
                if(!this.mounted) return;
                const timeoutId = setTimeout(() => this.pollPools(), HA_POLL_INTERVAL_MS);
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
                   // errorText: err.toString(),
                   pools: null,
                   timeoutId: null
               });
               this.props.navigator.popToTop();
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
                break;
        }
        this.mounted = false;
    }

    onPressPoolItem(pool) {
        this.mounted = false;
        this.props.navigator.push({ name: 'pool', serialNumber: pool.serialnumber});
    }

    onPressAddPool() {
        api.addPool(this.state.new_device_name, this.state.new_device_sn)
            .then(() => {
                this.refs.add_pool_modal.close()
                this.polllPools();
            })
            .catch(err =>{
                Alert.alert('Failed', 'This device did not upload any data.');
                }
            );
    }

    onPressDeletePool(pool) {
        this.setState({selected_pool: pool, delete_modal_text: ''});
        this.refs.delete_pool_modal.open();
    }

    deletePool() {
        api.removePool(this.state.selected_pool.serialnumber)
            .then(response => {
                // if (response.payload.status_code == 204){
                //     console.log("Successfully deleted...");
                // }
                this.refs.delete_pool_modal.close();
                this.polllPools();
            })
            .catch(err => {
                Alert.alert('Failed', 'Please try again.');
            });
    }

    onPressEditPool(pool) {
        this.setState({selected_pool: pool, edit_modal_text: pool.name});
        this.refs.edit_pool_modal.open();
    }

    editPool() {
        api.updatePoolName(this.state.selected_pool.serialnumber, this.state.edit_modal_text)
            .then(response => {
                // if (response.payload.status_code == 204){
                //     console.log("Successfully updated...");
                // }
                this.refs.edit_pool_modal.close();
                this.polllPools();
            })
            .catch(err => {
                Alert.alert('Failed', 'Please try again.');
            });
    }

    onCloseDialog() {
        this.setState({new_device_name: '', new_device_sn: ''});
    }

    renderMainContent() {
        const { pools } = this.state;
        // if (errorText) {
        //     Alert.alert('Error', errorText);
        //     return;
        // }
        if (!pools) return <LoadingIndicator />;
        if (pools.length)
            return <PoolList
                pools={pools}
                onPressPoolItem={this.onPressPoolItem.bind(this)}
                onPressDeletePool={this.onPressDeletePool.bind(this)}
                onPressEditPool={this.onPressEditPool.bind(this)}
            />;

        return <Text h4 style={{paddingVertical: 10, paddingHorizontal: 10}}>
            {store.admin === 'admin'? "You don't have any Pool. \nPlease add POOL." : "You don't have any Pool. \nPlease contact administrator to add Pool."}
            </Text>
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
                                  onPress={() => this.refs.add_pool_modal.open()}
                            /> : null
                    }
                </View>

                {/*NoteticationSystem add*/}
            </View>
            <Modal
                style={styles.modal}
                ref={"add_pool_modal"}
                onClosed={() => this.onCloseDialog()}
            >
                <View style={{flex: 1}}>
                    <Text h4 style={{marginLeft: 20, marginVertical:10}}>
                        New Device
                    </Text>
                    <FormLabel>Name</FormLabel>
                    <FormInput
                        inputStyle={{color: 'black'}}
                        value={this.state.new_device_name}
                        placeholder="E.g. Living Room Lamp"
                        returnKeyType="done"
                        onChangeText={(text) => this.setState({new_device_name: text})}
                    />
                    <FormLabel>Identity / Serial Number</FormLabel>
                    <FormInput
                        inputStyle={{color: 'black'}}
                        placeholder="E.g. abcde12345"
                        value={this.state.new_device_sn}
                        returnKeyType="done"
                        onChangeText={(text) => this.setState({new_device_sn: text})}
                    />
                </View>
                <View style={{flexDirection: "row", alignSelf:'flex-end', paddingBottom: 10}}>
                    <Button
                        title="Cancel"
                        backgroundColor={yellow600}
                        color={blue900}
                        fontSize={18}
                        raised
                        activeOpacity={0.5}
                        onPress={() => this.refs.add_pool_modal.close()}
                    />
                    <Button
                        title="Add"
                        backgroundColor={yellow600}
                        color={blue900}
                        fontSize={18}
                        raised
                        activeOpacity={0.5}
                        disabled={this.state.new_device_name == '' || this.state.new_device_sn == ''}
                        onPress={() => this.onPressAddPool()}
                    />
                </View>
            </Modal>

            <Modal
                style={{width: 350, height: 250}}
                ref={"delete_pool_modal"}
            >
                <View style={{flex: 1}}>
                    <Text h4 style={{marginLeft: 20, marginVertical:10}}>
                        DELETE Device
                    </Text>
                    <FormLabel containerStyle={{paddingBottom: 10}}>WARNING: This action cannot be undone. The device Wester's PC will be deleted permanently.</FormLabel>
                    <FormInput
                        inputStyle={{color: 'black'}}
                        value={this.state.delete_modal_text}
                        placeholder="Type 'DELETE' to confirm."
                        returnKeyType="done"
                        onChangeText={(text) => this.setState({delete_modal_text: text})}
                    />
                </View>
                <View style={{flexDirection: "row", alignSelf:'flex-end', paddingBottom: 10}}>
                    <Button
                        title="Cancel"
                        backgroundColor={yellow600}
                        color={blue900}
                        fontSize={18}
                        raised
                        activeOpacity={0.5}
                        onPress={() => this.refs.delete_pool_modal.close()}
                    />
                    <Button
                        title="Delete"
                        backgroundColor={yellow600}
                        color={blue900}
                        fontSize={18}
                        raised
                        activeOpacity={0.5}
                        disabled={this.state.delete_modal_text != 'DELETE'}
                        onPress={() => this.deletePool()}
                    />
                </View>
            </Modal>

            <Modal
                style={{width: 350, height: 210}}
                ref={"edit_pool_modal"}
            >
                <View style={{flex: 1}}>
                    <Text h4 style={{marginLeft: 20, marginVertical:10}}>
                        Device Name
                    </Text>
                    <FormLabel containerStyle={{paddingBottom: 10}}>Change device name</FormLabel>
                    <FormInput
                        inputStyle={{color: 'black'}}
                        value={this.state.edit_modal_text}
                        placeholder="Device name."
                        returnKeyType="done"
                        onChangeText={(text) => this.setState({edit_modal_text: text})}
                    />
                </View>
                <View style={{flexDirection: "row", alignSelf:'flex-end', paddingBottom: 10}}>
                    <Button
                        title="Cancel"
                        backgroundColor={yellow600}
                        color={blue900}
                        fontSize={18}
                        raised
                        activeOpacity={0.5}
                        onPress={() => this.refs.edit_pool_modal.close()}
                    />
                    <Button
                        title="Apply"
                        backgroundColor={yellow600}
                        color={blue900}
                        fontSize={18}
                        raised
                        activeOpacity={0.5}
                        disabled={this.state.edit_modal_text == ''}
                        onPress={() => this.editPool()}
                    />
                </View>
            </Modal>

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
        // position: 'absolute',
        // top: height - 70,
        // left: width - 70,
        alignSelf:'flex-end'
    },
    menuButton: {
        marginLeft: 20,
    },
    modal: {
        height: 270,
        width: 350,
    },

});