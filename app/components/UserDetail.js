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

import {Text, Icon, Card,ListItem} from 'react-native-elements';
import {Divider} from 'react-native-material-design';
import store from '../store';
import api from '../api';
import normalize from './common/normalize';
import Logo from './common/Logo';
import fonts from './common/font';
import {yellow600, blue900, grey300, blue400, green800, red500, lime500} from './common/color';
import LoadingIndicator from './common/LoadingIndicator';
const { width, height } = Dimensions.get("window");

export default class UserDetail extends Component {
    constructor(props) {
        super(props);
        this.state =  {
            user: this.props.user,
        }
    }

    componentWillMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    onPressDeleteUser() {

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
                                    <ListItem
                                        key={i}
                                        title={dev.name}
                                        subtitle={dev.sn}
                                        rightIcon={{name: 'cancel'}}
                                    />
                                ) : null
                            }
                            <Icon name='add'
                                  raised
                                  color='white'
                                  containerStyle={{backgroundColor:blue900}}
                                  underlayColor={blue400}
                                  size={18}

                            />
                            <Divider/>
                            <TouchableOpacity
                                activeOpacity={.5}
                                onPress={() => this.onPressDeleteUser()}>
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