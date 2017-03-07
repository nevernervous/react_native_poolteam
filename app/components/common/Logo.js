import React, {Component} from 'react';
import {View, Image, StyleSheet} from 'react-native';
export default class Logo extends Component {
    render() {
        return(
            <View style={styles.container}>
                <Image source={require('../../img/img_logo.png')} resizeMode="contain" />
            </View>

        );
    }
}

const styles = StyleSheet.create({
   container: {
       backgroundColor: '#FCFCFB',
       alignItems:"center",
       paddingTop: 20,
       paddingBottom: 10
   }
});