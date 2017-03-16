import React, {Component} from 'react';
import {
    Alert,
    View,
    StyleSheet,
    Dimensions,
    ScrollView,
} from 'react-native';

import {Text, Icon, Button, FormInput} from 'react-native-elements';
import { Divider } from 'react-native-material-design';
import Modal from 'react-native-modalbox';
import store from '../store';
import api from '../api';
import Logo from './common/Logo';
import {yellow600, blue900, grey300, grey600, grey700, grey800, grey900, blue400, green800, red400, red500} from './common/color';
import base32 from './common/base32';
import LoadingIndicator from './common/LoadingIndicator';
const { width, height } = Dimensions.get("window");

export default class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            b_loading: false,
            errorText: null,
            alert_emails: [],
            buf_index: null,
            btn_dialog: true,
            txt_dialog: '',
            alert_sms: [],
            alert_type: '',
            sender_phone: ''
        };
    }

    componentWillMount() {
        this.mounted = true;
        this.pollAlertMails();
        this.pollAlertSms();
        if (store.role == 'admin')
            this.pollSmsPhone();

    }

    componentWillUnmount() {
        this.mounted = false;
    }

    pollAlertMails() {
        this.setState({b_loading: true});
        api.get_alert('email')
            .then(response => {
                if (!this.mounted) return;
                console.log(response.payload);
                if (response.status === 304) this.setState({ errorText: null, b_loading: false});
                else {
                    if (response.payload.length > 0){
                        let emails = [];
                        for (var i=0; i < response.payload.length; i++)
                            emails.push(base32.decode(response.payload[i]));
                        this.setState({ alert_emails: emails});
                    } else {
                        this.setState({ alert_emails: []});
                    }
                    this.setState({ errorText: null, b_loading: false});
                }
            })
            .catch(err => {
                console.log(err);
                if (!this.mounted) return;
                this.setState({
                    errorText: err.toString(),
                    alert_emails: [],
                })
            });
    }

    pollAlertSms() {
        this.setState({b_loading: true});
        api.get_alert('sms')
            .then(response => {
                if (!this.mounted) return;
                // console.log(response.payload);
                if (response.status === 304) this.setState({ errorText: null, b_loading: false});
                else this.setState({ errorText: null, b_loading: false, alert_sms: response.payload});
            })
            .catch(err => {
                if (!this.mounted) return;
                this.setState({
                    errorText: err.toString(),
                    alert_sms: [],
                })
            });
    }

    pollSmsPhone(){
        this.setState({b_loading: true});
        api.getSmsPhone()
            .then(response => {
                if (!this.mounted) return;
                if (response.status === 304) this.setState({ errorText: null, b_loading: false});
                else {
                    this.setState({ sender_phone: response.payload, b_loading: false});
                }
            })
            .catch(err => {
                if (!this.mounted) return;
                this.setState({
                    errorText: err.toString(),
                    alert_emails: [],
                })
            });
    }

    onPressAddAlert(alert_type) {
        if (alert_type == 'sms') this.setState({txt_dialog: '+'});
        else if (alert_type == 'sender_phone') this.setState({txt_dialog: this.state.sender_phone});
        this.setState({alert_type: alert_type});
        this.refs.add_alert_modal.open();
    }

    onPressDeleteAlert(alert_type, index) {
        this.setState({buf_index: index, alert_type: alert_type});
        this.refs.delete_alert_modal.open();
    }

    onPressModalDeleteButton() {
        this.refs.delete_alert_modal.close();
        let target_alert = '';
        if (this.state.alert_type == 'email') target_alert = base32.encode(this.state.alert_emails[this.state.buf_index]);
        else target_alert = this.state.alert_sms[this.state.buf_index];
        api.delete_alert(this.state.alert_type, target_alert)
            .then(response => {
                // console.log(response);
                if (response.payload.status == 200){
                    console.log("Successfully deleted...");
                }
                if (this.state.alert_type == 'email') this.pollAlertMails();
                else this.pollAlertSms();
            })
            .catch(err => {
                console.log("Error");
                console.log(err);
                this.setState({isWorking: false});
            });
    }

    onChangeTextDeleteDialog(text) {
        this.setState({txt_dialog: text})
        if(text == 'DELETE') {
            this.setState({btn_dialog: false})
        } else {
            this.setState({btn_dialog: true})
        }
    }

    onChangeTextAddDialog(text) {
        if (this.state.alert_type == 'email')
            this.setState({txt_dialog: text, btn_dialog: !validateEmail(text)});
        else{
            if (isNumeric(text.toString().slice(1)))
                this.setState({txt_dialog: text});
            this.setState({btn_dialog: !validatePhone(text)});
        }
    }

    onCloseDialog() {
        this.setState({txt_dialog:'', btn_dialog: true})
    }

    onPressModalAddButton() {
        this.refs.add_alert_modal.close();
        let target_alert = '';
        if (this.state.alert_type == 'email')   // convert to base32 before uploading
            target_alert = base32.encode(this.state.txt_dialog);
        else // Remove `+` before uploading
            target_alert = this.state.txt_dialog.substr(1);

        if (this.state.alert_type != 'sender_phone')
            api.add_alert(this.state.alert_type, target_alert)
                .then(response => {
                    // console.log(response);
                    if (response.payload.status == 200){
                        console.log("Successfully added...");
                    }
                    if (this.state.alert_type == 'email') this.pollAlertMails();
                    else this.pollAlertSms();
                })
                .catch(err => {
                    console.log("Error");
                    console.log(err);
                });
        else
            api.setSmsPhone(this.state.txt_dialog)
                .then(response => {
                    // console.log(response);
                    if (response.payload.status == 200){
                        console.log("Successfully updated the sender's phone number...");
                    }
                    this.pollSmsPhone();
                })
                .catch(err => {
                    console.log("Error");
                    console.log(err);
                });
    }

    renderMainContent() {
        return (
            <ScrollView style={styles.content}>
                <View style={{flexDirection: 'row'}}>
                    <Icon name='snooze' size={30} color={grey800}/>
                    <Text h3 style={{marginLeft: 10, color: grey800}}>Alerts</Text>
                </View>

                <View style={{marginVertical:10}}>
                    <View style={{flexDirection: 'row'}}>
                        <Text h4 style={{color: grey800}}>Email Addresses</Text>
                        <Icon name="mail" size={30} color={grey600}/>
                    </View>
                    <Divider />

                    {
                        this.state.alert_emails.map((email, i) => (
                          <View style={{marginTop: 5, flexDirection: 'row', alignItems: 'center'}} key={i}>
                              <View style={styles.settingsInfoTextWrap}>
                                  <Text style={styles.settingsInfoText}>{email}</Text>
                              </View>
                              <Icon containerStyle={{marginLeft: 10}}
                                    name="delete-forever"
                                    color={red500}
                                    onPress={() => this.onPressDeleteAlert('email', i)}
                              />
                          </View>
                        ))

                    }
                    <Icon name='add'
                          raised
                          color='white'
                          containerStyle={{backgroundColor:blue900}}
                          underlayColor={blue400}
                          size={18}
                          onPress={() => this.onPressAddAlert('email')}
                    />
                </View>

                {(store.role === 'admin') &&
                    <View style={{marginVertical:10}}>
                        <Text h4 style={{color: grey800, marginBottom: 5}}>SMS Sender Phone Number</Text>
                        <Text style={{color: grey800}}> Visit twilio and get sender's phone number </Text>
                            <Divider />

                            <View style={{flexDirection:'row', marginTop: 10, alignItems:'center'}}>
                                <View style={styles.settingsInfoTextWrap}>
                                    <Text style={styles.settingsInfoText}>{this.state.sender_phone}</Text>
                                </View>
                                <Icon containerStyle={{marginLeft: 10}}
                                      name="mode-edit"
                                      size={20}
                                      onPress={() => this.onPressAddAlert('sender_phone')}
                                />
                            </View>
                    </View>
                }

                <View style={{marginTop:10}}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text h4 style={{color: grey800}}>SMS Phone Numbers</Text>
                        <Icon name="textsms" size={30} color={grey600}/>
                    </View>
                    <Divider />

                    {
                        this.state.alert_sms.map((sms, i) => (
                            <View style={{marginTop: 5, flexDirection: 'row'}} key={i}>
                                <View style={styles.settingsInfoTextWrap}>
                                    <Text style={styles.settingsInfoText}>{sms}</Text>
                                </View>
                                <Icon containerStyle={{marginLeft: 10}}
                                      name="delete-forever"
                                      color={red500}
                                      onPress={() => this.onPressDeleteAlert('sms', i)}
                                />
                            </View>
                        ))

                    }

                    <Icon name='add'
                          raised
                          color='white'
                          containerStyle={{backgroundColor:blue900}}
                          underlayColor={blue400}
                          size={18}
                          onPress={() => this.onPressAddAlert('sms')}
                    />
                </View>
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
                    <Text h4 style={styles.headerText}>Settings</Text>
                </View>
                {this.state.b_loading? <LoadingIndicator/>: this.renderMainContent()}

                <Modal
                    style={styles.modal}
                    ref={"delete_alert_modal"}
                    onClosed={() => this.onCloseDialog()}
                >
                    <View style={{flex: 1}}>
                        <Text h4 style={{marginLeft: 20, marginVertical:20}}>Delete Alert {this.state.alert_type}</Text>
                        <FormInput
                            value={this.state.txt_dialog}
                            onChangeText={this.onChangeTextDeleteDialog.bind(this)}
                            placeholder="Type 'DELETE' to confirm"
                            inputStyle={{color: 'black'}}
                            containerStyle={styles.modal_input}
                            returnKeyType="done"
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
                            onPress={() => this.refs.delete_alert_modal.close()}

                        />
                        <Button
                            title="Delete"
                            backgroundColor={yellow600}
                            color={blue900}
                            fontSize={18}
                            raised
                            activeOpacity={0.5}
                            disabled={this.state.btn_dialog}
                            onPress={() => this.onPressModalDeleteButton()}

                        />
                    </View>
                </Modal>

                <Modal
                    style={styles.modal}
                    ref={"add_alert_modal"}
                    onClosed={() => this.onCloseDialog()}
                >
                    <View style={{flex: 1}}>
                        <Text h4 style={{marginLeft: 20, marginVertical:20}}>
                            {(this.state.alert_type != 'sender_phone') ? `Add Alert ${this.state.alert_type}` : `Edit SMS Sender's Phone #` }
                        </Text>
                        <FormInput
                            value={this.state.txt_dialog}
                            onChangeText={this.onChangeTextAddDialog.bind(this)}
                            placeholder={ "Input alert " + this.state.alert_type}
                            inputStyle={{color: 'black'}}
                            containerStyle={styles.modal_input}
                            returnKeyType="done"
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
                            onPress={() => this.refs.add_alert_modal.close()}
                        />
                        <Button
                            title="Add"
                            backgroundColor={yellow600}
                            color={blue900}
                            fontSize={18}
                            raised
                            activeOpacity={0.5}
                            disabled={this.state.btn_dialog}
                            onPress={() => this.onPressModalAddButton()}
                        />
                    </View>
                </Modal>
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
        marginLeft:20,
    },
    settingsInfoTextWrap: {
        marginTop: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#CCC",
        width: 300,
    },
    settingsInfoText: {
        color: grey900,
        fontSize: 20,
    },
    modal: {
        height: 220,
        width: 350,
    },
    modal_input: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },

});

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

// Validate phone number with E.164 standard
function validatePhone(phone_number){
    var re = /^\+?[1-9]\d{1,14}$/;
    return re.test(phone_number);
}

function isNumeric(n) {
    return (!isNaN(parseFloat(n)) && isFinite(n)) || (n == '');
}