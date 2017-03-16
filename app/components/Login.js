import React, {Component} from 'react';
import {
    Alert,
    View,
    StyleSheet,
    Text,
    Dimensions,
    Image,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';

import dismissKeyboard from 'react-native-dismiss-keyboard';

import {Button} from 'react-native-elements';
import Modal from 'react-native-modalbox';
import LoadingIndicator from './common/LoadingIndicator';
import {yellow600, blue900} from './common/color';
import store from '../store';
import api from '../api';

const { width, height } = Dimensions.get("window");

export default class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            // email: "a@a.com",
            email: "rpiguru@techie.com",
            password: "12345678",
            isAuthenticating: false,
            recoveryEmail: '',
        }
    }

    componentDidMount() {
        this.onPressLogin();
    }
    focusNextField = (nextField) => {
        this.refs[nextField].focus();
    };

    onPressSignup() {
        this.props.navigator.push({ name: 'signup' });
    }

    validateField() {
        if (this.state.email == "" || this.state.password == "") {
            Alert.alert("Login Failed", "Please enter the Email and Password");
            return false;
        }
        return true;
    }

    onPressSend() {

        // Check if this email is already registered or not
        if(this.state.recoveryEmail == '') {
            Alert.alert('PoolTeam', 'Please enter the email.');
            return;
        }
        this.refs.forgot_password_modal.close();
        api.request_recover(this.state.recoveryEmail)
            .then(response => {
                Alert.alert('PoolTeam', 'Password recovery email sent. please check your mailbox.');
            })
            .catch(err => {
                Alert.alert('Fail', 'User email is not registered.');
            });
        this.setState({recoveryEmail: ''});
    }

    onPressLogin() {
        if(!this.validateField())
            return;
        this.setState({isAuthenticating: true});
        api.login(this.state.email, this.state.password)
            .then(response => {
                store.email = this.state.email;
                store.token = response.payload.token;
                store.name = response.payload.name;
                store.role = response.payload.role;
                this.setState({isAuthenticating: false});
                this.props.navigator.push({ name: 'mypool' });
            })
            .catch(err => {
                this.setState({isAuthenticating: false});
                Alert.alert("Login Failed", "Invalid email or password");
            });
    }
    render() {

        return (
            <TouchableWithoutFeedback onPress={()=> dismissKeyboard()}>
                <View style={styles.container}>

                    <View style={styles.logoView}>
                        <Image source={require('../img/img_logo.png')} resizeMode="contain"/>
                        <Text style={{padding: 20}}>POOLTEAM | Manage Your Pool Remotely</Text>
                    </View>

                    <View style={{alignItems: "center"}}>
                        <Text style={{fontSize: 40}} >Login</Text>
                    </View>

                    <View style={{paddingTop: 10, alignItems: "center"}}>
                        <View style={styles.inputWrap}>
                            <TextInput
                                ref="1"
                                value={this.state.email}
                                onChangeText={(text) => this.setState({email: text})}
                                placeholder="Email Address"
                                style={styles.input}
                                keyboardType="email-address"
                                returnKeyType="next"
                                onSubmitEditing={() => this.focusNextField('2')}
                            />
                        </View>
                        <View style={styles.inputWrap}>
                            <TextInput
                                ref="2"
                                value={this.state.password}
                                onChangeText={(text) => this.setState({password: text})}
                                placeholder="Password"
                                style={styles.input}
                                secureTextEntry
                                returnKeyType="done"
                                onSubmitEditing={() => this.onPressLogin()}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={.5}
                        onPress={() => this.refs.forgot_password_modal.open()}
                    >
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <View style={{alignItems: "center", paddingVertical: 10}}>
                        <Button
                            title="Log In"
                            buttonStyle={styles.LoginButton}
                            backgroundColor={yellow600}
                            color={blue900}
                            fontSize={18}
                            raised
                            activeOpacity={0.5}
                            onPress={() => this.onPressLogin()}
                            disabled={this.state.isAuthenticating}

                        />
                    </View>

                    <View style={{alignItems: "center", flexDirection: "row", justifyContent: "center"}}>
                        <Text>Don't have account?</Text>
                        <TouchableOpacity activeOpacity={.5} onPress={() => this.onPressSignup()}>
                                <Text style={styles.signupLinkText}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>

                    <LoadingIndicator show={this.state.isAuthenticating} />

                    <Modal
                        style={styles.modal}
                        ref={"forgot_password_modal"}
                        onClosed={() => this.setState({recoveryEmail: ''})}
                    >
                        <View style={styles.modal_inputWrap}>
                            <TextInput
                                value={this.state.recoveryEmail}
                                onChangeText={(text) => this.setState({recoveryEmail: text})}
                                placeholder="Recovery Email Address"
                                style={styles.modal_input}
                                keyboardType="email-address"
                                returnKeyType="done"
                                onSubmitEditing={() => this.onPressSend()}
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
                                onPress={() => this.refs.forgot_password_modal.close()}

                            />
                            <Button
                                title="Send"
                                backgroundColor={yellow600}
                                color={blue900}
                                fontSize={18}
                                raised
                                activeOpacity={0.5}
                                onPress={() => this.onPressSend()}

                            />
                        </View>
                    </Modal>
                </View>
            </TouchableWithoutFeedback>


        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    logoView: {
        alignItems: "center",
        paddingTop: 100
    },
    inputWrap: {
        alignItems: "center",
        marginVertical: 10,
        height: 40,
        width: width - 50,
        borderBottomWidth: 1,
        borderBottomColor: "#CCC"
    },
    iconWrap: {
        paddingHorizontal: 7,
        alignItems: "center",
        justifyContent: "center",
    },
    icon: {
        height: 20,
        width: 20,
    },
    input: {
        flex: 1,
        paddingHorizontal: 10,
    },
    LoginButton: {
        height: 40,
        width: width-50,
    },

    forgotPasswordText: {
        paddingTop: 10,
        paddingRight: 20,
        color: blue900,
        backgroundColor: "transparent",
        textAlign: "right",
    },
    signupLinkText: {
        color: blue900,
        paddingLeft: 5,
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