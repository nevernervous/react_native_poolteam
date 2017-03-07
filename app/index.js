import React, {Component} from 'react';
import {StyleSheet, Navigator} from 'react-native';
import Login from './components/Login';
import Signup from './components/Signup';
import MyPool from './components/MyPool';
import Pool from './components/Pool';
import Users from './components/Users';
import Sensor from './components/Sensor';
import Settings from './components/Settings';

var ROUTES = {
    login: Login,
    signup: Signup,
    mypool: MyPool,
    users: Users,
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
        return <RouteComponent navigator={navigator} {...route}/>;
    }

    render() {
        return (
            <Navigator
                style = {styles.container}
                initialRoute={{name: 'login'}}
                renderScene={this.renderScene}
                configureScene={() => {return Navigator.SceneConfigs.PushFromRight;}}
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