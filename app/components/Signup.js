import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    Text,
    Dimensions,
    Image,
    TextInput,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
} from 'react-native';

import {Button} from 'react-native-elements';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import {yellow600, blue900} from './common/color';
import api from '../api';

const { width, height } = Dimensions.get("window");

const VERIFY_TEXT = 'You\'ve just been sent an email that contains a confirmation link. \
                    In order to activate your account, please click the verification link in the email we just sent you.';

function CheckEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

export default class Signup extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userName: '',
            email: '',
            password: '',
            confirmPassword: ''
        };
    }

    focusNextField = (nextField) => {
        this.refs[nextField].focus();
    };

    onPressLogIn() {
        this.props.navigator.push({ name: 'login' });
    }

    onPressSignup() {
        if(!this.validateField())
            return;
        api.signup(this.state.email, this.state.userName, this.state.password)
            .then( response => {
                Alert.alert('Verify your email', VERIFY_TEXT);
                this.props.navigator.push({ name: 'login' });
            })
            .catch(err => {
                const stateError = {};
                const payload = err.response && err.response.payload;
                if (typeof payload === 'string') {
                    try {
                        stateError.errorText = JSON.parse(payload).message;
                    } catch (e){
                        stateError.errorText = payload;
                    }

                } else {
                    stateError.errorText = err.message;
                }

                Alert.alert('Sign up failed.', stateError.errorText);
            });
    }

    validateField() {
        if (this.state.userName == '' || this.state.email == '' || this.state.password == '' || this.state.confirmPassword == '') {
            Alert.alert('Sign up failed', 'Please fill out the forms.')
            return false;
        }

        if(!CheckEmail(this.state.email)) {
            Alert.alert('Sign up failed', 'Invalid email.')
            return false;
        }

        if(this.state.password !== this.state.confirmPassword) {
            Alert.alert('Sign up failed', 'Passwords do not match.')
            return false;
        }
        return true;
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
                        <Text style={{fontSize: 40}} >Signup</Text>
                    </View>


                    <View style={{paddingTop: 10, alignItems: "center"}}>
                        <View style={styles.inputWrap}>
                            <TextInput
                                ref="1"
                                placeholder="User Name"
                                style={styles.input}
                                onChangeText={(text) => this.setState({userName: text})}
                                returnKeyType="next"
                                onSubmitEditing={() => this.focusNextField('2')}
                            />
                        </View>
                        <View style={styles.inputWrap}>
                            <TextInput
                                ref="2"
                                placeholder="Email Address"
                                style={styles.input}
                                keyboardType="email-address"
                                onChangeText={(text) => this.setState({email: text})}
                                returnKeyType="next"
                                onSubmitEditing={() => this.focusNextField('3')}
                            />
                        </View>
                        <View style={styles.inputWrap}>
                            <TextInput
                                ref="3"
                                placeholder="Password"
                                style={styles.input}
                                secureTextEntry
                                returnKeyType="next"
                                onChangeText={(text) => this.setState({password: text})}
                                onSubmitEditing={() => this.focusNextField('4')}
                            />
                        </View>
                        <View style={styles.inputWrap}>
                            <TextInput
                                ref="4"
                                placeholder="Confirm Password"
                                style={styles.input}
                                secureTextEntry
                                returnKeyType="done"
                                onChangeText={(text) => this.setState({confirmPassword: text})}
                                onSubmitEditing={() => this.onPressSignup()}
                            />
                        </View>
                    </View>

                    <View style={{alignItems: "center", paddingVertical: 10}}>
                        <Button
                            title="Sign Up"
                            buttonStyle={styles.SignupButton}
                            backgroundColor={yellow600}
                            color={blue900}
                            fontSize={18}
                            raised
                            activeOpacity={0.5}
                            onPress={() => this.onPressSignup()}

                        />
                    </View>

                    <View style={{alignItems: "center", flexDirection: "row", justifyContent: "center",}}>
                        <Text>Already have an account?</Text>
                        <TouchableOpacity activeOpacity={.5} onPress={() => this.onPressLogIn()}>
                                <Text style={styles.loginLinkText}>Log In</Text>
                        </TouchableOpacity>
                    </View>

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
    SignupButton: {
        width: width - 50,
        height: 40,
    },

    loginLinkText: {
        color: "#0d47a1",
        paddingLeft: 5,
    }
});