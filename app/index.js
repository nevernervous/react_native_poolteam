import React, {Component} from 'react';
import {StyleSheet, Navigator, BackAndroid} from 'react-native';
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

var navigator;
export default class App extends Component {
    constructor(props) {
        super(props);
        // this.navigator = {};
    }

    renderScene(route, navigator) {
        // this.navigator = navigator;
        let RouteComponent = ROUTES[route.name];
        return <RouteComponent ref={component => { route.scene = component; }}
                               navigator={navigator} {...route}/>;
    }

    _onWillFocus(route) {
        if (route.scene && route.scene.componentWillFocus) {
            route.scene.componentWillFocus();
        }
    }

    componentDidMount() {
        BackAndroid.addEventListener('hardwareBackPress', this.handleBack);
    }

    handleBack() {
        if (navigator && navigator.getCurrentRoutes().length > 1) {
            navigator.pop();
            return true; //avoid closing the app
        }
        return false; //close the app
    }

    render() {
        return (
            <Navigator
                ref={(nav) => { navigator = nav; }}
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