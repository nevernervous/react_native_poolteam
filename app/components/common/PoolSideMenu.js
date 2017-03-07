import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import {Icon,Text} from 'react-native-elements';
import {yellow600, blue900} from './color';

const window = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: blue900,
    },
    iconStyle: {
        marginHorizontal: 30,
    },
    topView: {
        paddingTop: 50,
        height: 100,
        backgroundColor: blue900,
        borderBottomWidth: 1,
        borderBottomColor: "#CCC",
        alignItems: 'center'
    },
    menuItemText: {
        color: yellow600,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    }
});

export default class PoolSideMenu extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const menuList = [
            {
                title: this.props.admin ? 'Users' : 'Help',
                icon: this.props.admin ? 'supervisor-account': 'announcement'
            },
            {
                title: 'Settings',
                icon: 'settings'
            },
            {
                title: 'Logout',
                icon: 'input'
            }
        ];
        return (
            <ScrollView scrollsToTop={false} style={styles.container}>
                <View style={styles.topView}>
                    <Text h3 style={styles.menuItemText}>PoolTeam</Text>
                </View>
                <View style={{paddingTop: 30}}>
                    {
                        menuList.map((l, i) => (
                            <TouchableOpacity activeOpacity={.5} style={styles.menuItem} key={i} onPress={() => this.props.onMenuItemSelected(l.title)}>
                                    <Icon name={l.icon} size={40} color={yellow600}containerStyle={styles.iconStyle}/>
                                    <Text h4 style={styles.menuItemText}>{l.title}</Text>
                            </TouchableOpacity>
                        ))
                    }
                </View>
            </ScrollView>
        );
    }
};
