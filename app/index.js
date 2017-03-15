import React, {Component} from 'react';
import {StyleSheet, Navigator} from 'react-native';
import Login from './components/Login';
import Signup from './components/Signup';
import MyPool from './components/MyPool';
import Pool from './components/Pool';
import Users from './components/Users';
import UserDetail from './components/UserDetail';
import Sensor from './components/Sensor';
import Settings from './components/Settings';

var ROUTES = {
    login: Login,
    signup: Signup,
    mypool: MyPool,
    users: Users,
    userdetail: UserDetail,
    pool: Pool,
    sensor: Sensor,
    settings: Settings,
};

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    renderScene(route, navigator) {
        let RouteComponent = ROUTES[route.name];
        return <RouteComponent ref={component => { route.scene = component; }}
                               navigator={navigator} {...route}/>;
    }

    _onWillFocus(route) {
        if (route.scene && route.scene.componentWillFocus) {
            route.scene.componentWillFocus();
        }
    }

    render() {
        return (
            <Navigator
                style = {styles.container}
                initialRoute={{name: 'login'}}
                renderScene={this.renderScene}
                configureScene={() => ({...Navigator.SceneConfigs.PushFromRight, gestures: null})}
                onWillFocus={this._onWillFocus}
            />

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
            backgroundColor: '#FCFCFB',
    },
});