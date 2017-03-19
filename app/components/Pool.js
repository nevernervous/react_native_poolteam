import React, {Component} from 'react';
import {
    Alert,
    View,
    StyleSheet,
    Dimensions,
} from 'react-native';

import {Text, Icon} from 'react-native-elements';
import { Divider } from 'react-native-material-design';

import PoolInfoItem from './common/PoolInfoItem';
import store from '../store';
import api from '../api';
import Logo from './common/Logo';
import {yellow600, blue900, grey300, blue400, green800, red400} from './common/color';
import LoadingIndicator from './common/LoadingIndicator';
const { width, height } = Dimensions.get("window");
const HA_POLL_INTERVAL_MS = 30000;

function getMuranoErrorText() {
    return `Murano Error: It appears this serial number was either not
    added as a device, this device was not activated, the product was
    not associated with this solution, or the device has not written
    to the platform.`;
}

export default class Pool extends Component {
    constructor(props) {
        super(props);
        let pool = null;
        if (store.pools) {
            pool = store.pools.filter(wall => wall.serialnumber == this.props.serialNumber)[0];
            // if (pool && (pool.state === null || !pool.hasOwnProperty('state') || pool.state === "undefined")) {
            //     pool = null;
            //     errorText = getMuranoErrorText();
            // }
        }

        this.state = {
            // errorText: null,
            isChangingWallState: false,
            pool: pool,
            poolName: pool.name,
        };
    }

    componentWillMount() {
        this.mounted = true;
        this.pollPools();
    }

    componentWillUnmount() {
        this.mounted = false;
        clearTimeout(this.state.timeoutId);
    }

    componentWillFocus() {
        this.mounted = true;
        this.pollPools();
    }

    pollPools() {
        api.getPools()
            .then(response => this.handlePoolApiResponse(response))
            .catch(err => {
                clearTimeout(this.state.timeoutId);
                // if (!this.mounted) return;
                // this.setState({
                //     errorText: err.toString(),
                //     pool: null,
                //     timeoutId: null,
                // });
                this.props.navigator.popToTop();
            });
    }

    handlePoolApiResponse(response) {
        if (!this.mounted) return;
        const timeoutId = setTimeout(() => this.pollPools(), HA_POLL_INTERVAL_MS);
        const serialnumber = this.props.serialNumber;
        const pools = response.payload;
        const pool = pools.filter(wall => wall.serialnumber == serialnumber)[0];
        if (response.status === 304)
            this.setState({
                // errorText: null,
                timeoutId
            });
        else{
            this.setState({
                // errorText: null,
                pool, timeoutId
            });
        }
    }

    onPressInfoItem(alias) {
        clearTimeout(this.state.timeoutId);
        this.mounted = false;
        this.props.navigator.push({name: 'sensor', alias: alias, poolName:this.state.poolName, serialNumber:this.props.serialNumber});

    }

    renderMainContent() {
        const { pool } = this.state;
        if (!pool) return <LoadingIndicator />;

        let temperature = parseFloat(pool.Temperature);
        let ph = parseFloat(pool.pH);
        let orp = parseFloat(pool.ORP);
        let flow = parseFloat(pool.Flow);

        return (
            <View style={styles.content}>
                <PoolInfoItem alias="pH" value={ph} onPress={this.onPressInfoItem.bind(this)}/>
                <Divider/>
                <PoolInfoItem alias="ORP" value={orp} onPress={this.onPressInfoItem.bind(this)}/>
                <Divider/>
                <PoolInfoItem alias="Temperature" value={temperature} onPress={this.onPressInfoItem.bind(this)}/>
                <Divider/>
                <PoolInfoItem alias="Flow" value={flow} onPress={this.onPressInfoItem.bind(this)}/>
                <Divider/>
            </View>
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
                    <Text h4 style={styles.headerText}>{this.state.poolName}</Text>
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
    menuButton: {
        marginLeft: 20,
    },
    content: {
        marginVertical: 50,
        marginHorizontal: 30,
    },
});