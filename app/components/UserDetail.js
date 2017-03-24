import React, {Component} from 'react';
import {
    Alert,
    View,
    StyleSheet,
    Dimensions,
    Image,
    ScrollView,
    ListView,
    Platform,
    TouchableOpacity,
} from 'react-native';

import {Text, Icon, Card,ListItem, Button, FormInput,} from 'react-native-elements';
import {Divider} from 'react-native-material-design';
import Modal from 'react-native-modalbox';
import DeviceListItem from './common/ListItem';
import store from '../store';
import api from '../api';
import normalize from './common/normalize';
import Logo from './common/Logo';
import fonts from './common/font';
import {yellow600, blue900, grey300, blue400, red500} from './common/color';
const { width, height } = Dimensions.get("window");

export default class UserDetail extends Component {
    constructor(props) {
        super(props);
        this.state =  {
            user: this.props.user,
            dlg_text: '',
            btn_dialog: false,
            dlg_type: '',
            cur_dev: null,
        }
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    OpenModal(dlg_type) {
        this.setState({dlg_type: dlg_type, dlg_text: ''})
        this.refs.modal.open();
    }

    onCloseDialog() {
        this.setState({dlg_text:'', btn_dialog: false})
    }

    onPressModalConfirmButton() {
        switch (this.state.dlg_type) {
            case 'delete':
                api.deleteUser(this.state.user.id)
                    .then(response => {
                        this.refs.modal.close();
                        this.props.navigator.pop();
                    })
                    .catch(err => {
                        Alert.alert('Error', err.toString());
                    });
                break;

            case 'dismiss':
                api.dismissDeviceFromUser(store.email, this.state.user.id, this.state.cur_dev.sn)
                    .then(response => {
                        let user = this.state.user;
                        if (response.payload == 'Ok'){
                            for (let i=0; i < user.devices.length; i++)
                                if (user.devices[i].sn == this.state.cur_dev.sn)
                                    user.devices.splice(i, 1);
                        }
                        this.setState({ user: user});
                        this.refs.modal.close();
                    })
                    .catch(err => {
                        Alert.alert('Error', err.toString());
                    });
                break;

            case 'assign':
                api.assignDeviceToUser(store.email, this.state.user.id, this.state.dlg_text)
                    .then(response => {
                        let user = this.state.user;
                        if (user.devices.length > 0)
                            user.devices.push({"name": response.payload, "sn": this.state.dlg_text});
                        else
                            user.devices = [{"name": response.payload, "sn": this.state.dlg_text}];
                        this.setState({ user: user});
                        this.refs.modal.close();
                    })
                    .catch(err => {
                        Alert.alert('Error', err.toString());
                    });
                break;

        }
    }

    onChangeTextDialog(text) {
        this.setState({dlg_text: text});
        if (this.state.dlg_type == 'assign')
            this.setState({btn_dialog : (text.length > 0)});
        else if (this.state.dlg_type == 'dismiss')
            this.setState({btn_dialog : (text == 'DISMISS')});
        else
            this.setState({btn_dialog : (text == 'DELETE')});
    }

    renderMainContent() {
        const userRole = this.state.user.role === 'admin' ? "Administrator" : "Guest";
        return (
            <ScrollView style={styles.content}>
                <Card
                >
                    <View>
                        <Text style={styles.cardTitle}>User Details</Text>
                        <Divider/>
                    </View>
                    <ListItem
                        title={"User Name: " + this.state.user.name}
                        hideChevron={true}
                    />
                    <ListItem
                        title={"User Email: " + this.state.user.email}
                        hideChevron={true}
                    />
                    <ListItem
                        title={"Created: " + epoch_to_date(this.state.user.creation_date)}
                        hideChevron={true}
                    />
                    <ListItem
                        title={"Status: " + getStatus(this.state.user.status)}
                        hideChevron={true}
                    />
                    <ListItem
                        title={"User Role: " + userRole}
                        hideChevron={true}
                    />

                    {this.state.user.role === 'admin' ?
                        null :
                        <View style={{paddingTop: 10}}>
                            <Text style={styles.cardTitle}>Assigned Devices</Text>
                            <Divider/>
                            {
                                this.state.user.devices.length > 0 ?
                                this.state.user.devices.map((dev, i) =>
                                    <DeviceListItem
                                        key={i}
                                        title={dev.name}
                                        subtitle={dev.sn}
                                        rightIcon={{name: 'cancel', onPress: () => {this.setState({cur_dev: dev}); this.OpenModal('dismiss');}}}

                                    />
                                ) : null
                            }
                            <Icon name='add'
                                  raised
                                  color='white'
                                  containerStyle={{backgroundColor:blue900}}
                                  underlayColor={blue400}
                                  size={18}
                                  onPress={() => this.OpenModal('assign')}

                            />
                            <Divider/>
                            <TouchableOpacity
                                activeOpacity={.5}
                                onPress={() => this.OpenModal('delete')}
                            >
                                <View style={{flexDirection: 'row', alignItems: "center", justifyContent: 'flex-end', paddingTop: 5}}>
                                    <Icon name="delete"
                                          color={red500}
                                    />
                                    <Text style={{color: red500}}>DELETE USER</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    }
                </Card>

            </ScrollView>
        );
    }

    renderModal() {
        let modal_title = '';
        let placeholder = '';
        let confirmText = '';
        switch (this.state.dlg_type) {
            case 'dismiss':
                modal_title = 'Dismiss Device (' + this.state.cur_dev.name + ') from [' + this.state.user.name + ']';
                placeholder =  "Type 'DISMISS' to confirm";
                confirmText = 'DISMISS';
                break;
            case 'assign':
                modal_title = 'Assign Device to [' + this.state.user.name + ']';
                placeholder =  "Input Device Serial Number";
                confirmText = 'ASSIGN';
                break;
            case 'delete':
                modal_title = 'Delete [' + this.state.user.name + ']';
                placeholder =  "Type 'DELETE' to confirm";
                confirmText = 'DELETE';
                break;
        }
        return (
            <Modal
                style={styles.modal}
                ref={"modal"}
                onClosed={() => this.onCloseDialog()}
            >
                <View style={{flex: 1}}>
                    <Text h4 style={{marginLeft: 20, marginVertical:15}}>{modal_title}</Text>
                    <FormInput
                        value={this.state.txt_dialog}
                        placeholder={placeholder}
                        inputStyle={{color: 'black'}}
                        containerStyle={styles.modal_input}
                        returnKeyType="done"
                        onChangeText={this.onChangeTextDialog.bind(this)}
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
                        onPress={() => this.refs.modal.close()}

                    />
                    <Button
                        title={confirmText}
                        backgroundColor={yellow600}
                        color={blue900}
                        fontSize={18}
                        raised
                        activeOpacity={0.5}
                        disabled={!this.state.btn_dialog}
                        onPress={() => this.onPressModalConfirmButton()}

                    />
                </View>
            </Modal>
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
                    <Text h4 style={styles.headerText}>User - {this.props.user.name} </Text>
                </View>
                {this.renderMainContent()}
                {this.renderModal()}
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
    menuButton: {
        marginLeft: 20,
    },
    content: {
        marginTop: 10,
    },
    cardTitle: {
        fontSize: normalize(14),
        ...Platform.select({
            ios: {
                fontWeight: 'bold'
            },
            android: {
                fontFamily: fonts.android.black
            }
        }),
        marginBottom: 5,
        color: "#43484d"
    },
    modal: {
        height: 220,
        width: 350,
    },
    modal_input: {
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
});

function epoch_to_date(sec) {
    let d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(sec);
    return d.toLocaleString()
}

function getStatus(code) {
    if (code == 1)
        return "Activated";
    else if (code == 0)
        return "Not Activated";
    else
        return "Disabled"
}