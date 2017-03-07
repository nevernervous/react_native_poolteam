import React, {Component} from 'react';
import {View,TouchableHighlight, StyleSheet} from 'react-native';
import {Text} from 'react-native-elements';
import {blue400, green800, red400} from './color';

export default class PoolInfoItem extends Component {
    constructor(props) {
        super(props);
        switch (this.props.alias) {
            case 'pH':
                this.name = 'PH';
                this.unit = 'PH';
                this.color = (5.5 < this.props.value && this.props.value < 8.5) ? green800: red400;
                break;
            case 'ORP':
                this.name = 'REDOX';
                this.unit = 'mV';
                this.color = (3000 > this.props.value) ? green800: red400;
                break;
            case 'Temperature':
                this.name = 'Temperature';
                this.unit = '°C';
                this.color = (20 < this.props.value && this.props.value < 35) ? green800: red400;
                break;
            case 'Flow':
                this.name = 'Flow';
                this.unit = 'm\xB3/Hr';
                this.color = green800;
                break;
        }
    }

    render() {
        return (
            <TouchableHighlight
                underlayColor={blue400}
                onPress={() => this.props.onPress(this.props.alias)}
                style={styles.container}
            >
                <View style={{flexDirection: 'row'}}>
                    <Text h4 style={styles.infoTitleText}>{this.name}</Text>
                    <View style={styles.infoTextView}>
                        <Text h4 style={{color: this.color}} >{this.props.value.toFixed(1)} {this.unit}</Text>
                    </View>
                </View>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    container:{
        marginVertical: 10,
    },
    infoTitleText: {
        marginLeft: 5,
    },
    infoTextView: {
        flex: 1,
        alignItems: 'flex-end',
        marginRight: 5,
    },
});