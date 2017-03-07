import React, {Component} from 'react';
import {
    Alert,
    View,
    StyleSheet,
    Dimensions,
    ScrollView,
    TextInput,
} from 'react-native';

import {Text, Icon, Button, List} from 'react-native-elements';
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
            isWorking: false,
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
                        this.setState({ alert_emails: emails, b_loading: false});
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

    onPressAddEmail() {

    }

    onPressAddSMSPhoneNumber() {

    }

    onPressDeleteAlert(alert_type, index) {
        this.setState({buf_index: index, alert_type: alert_type});
        this.refs.delete_alert_modal.open();
    }

    onPressModalDeleteButton() {

    }

    onChangeTextDeleteDialog(text) {
        this.setState({txt_dialog: text})
        if(text == 'DELETE') {
            this.setState({btn_dialog: false})
        } else {
            this.setState({btn_dialog: true})
        }
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
                        this.state.alert_emails.length ?
                            this.state.alert_emails.map((email, i) => (
                              <View style={{marginVertical: 5, flexDirection: 'row'}} key={i}>
                                  <View style={styles.settingsInfoTextWrap}>
                                      <Text style={styles.settingsInfoText}>{email}</Text>
                                  </View>
                                  <Icon containerStyle={{marginLeft: 10}}
                                        name="delete-forever"
                                        color={red500}
                                        onPress={() => this.onPressDeleteAlert('email', i)}
                                  />
                              </View>
                            )): null

                    }
                    <Icon name='add'
                          raised
                          color='white'
                          containerStyle={{backgroundColor:blue900}}
                          underlayColor={blue400}
                          size={18}
                          onPress={() => this.onPressAddEmail()}
                    />
                </View>

                <View style={{marginVertical:10}}>
                    <Text h4 style={{color: grey800, marginBottom: 5}}>SMS Sender Phone Number</Text>
                    <Text style={{color: grey800}}> Visit twilio and get sender's phone number </Text>
                    <Divider />

                    <View style={{flexDirection:'row', marginTop: 10}}>
                        <View style={styles.settingsInfoTextWrap}>
                            <Text style={styles.settingsInfoText}>{this.state.sender_phone}</Text>
                        </View>
                        <Icon containerStyle={{marginLeft: 10}} name="mode-edit" />
                    </View>
                </View>

                <View style={{marginVertical:10}}>
                    <View style={{flexDirection: 'row'}}>
                        <Text h4 style={{color: grey800}}>SMS Phone Numbers</Text>
                        <Icon name="textsms" size={30} color={grey600}/>
                    </View>
                    <Divider />
                    <Icon name='add'
                          raised
                          color='white'
                          containerStyle={{backgroundColor:blue900}}
                          underlayColor={blue400}
                          size={18}
                          onPress={() => this.onPressAddSMSPhoneNumber()}
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
                >
                    <View style={styles.modal_inputWrap}>
                        <TextInput
                            value={this.state.txt_dialog}
                            onChangeText={this.onChangeTextDeleteDialog.bind(this)}
                            placeholder="Type 'DELETE' to confirm"
                            style={styles.modal_input}
                            returnKeyType="done"
                        />
                    </View>

                    <View style={{flexDirection: "row", alignSelf:'flex-end'}}>
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
    content: {
        marginTop: 10,
        marginHorizontal:20,
    },
    settingsInfoTextWrap: {
        marginVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#CCC",
        width: 300,
    },
    settingsInfoText: {
        color: grey900,
        fontSize: 20,
    },
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 130,
        width: 300,
    },
    modal_inputWrap: {
        alignItems: "center",
        marginVertical: 10,
        height: 40,
        width: 250,
        borderBottomWidth: 1,
        borderBottomColor: "#CCC"
    },
    modal_input: {
        flex: 1,
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