import React ,{Component} from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    Dimensions,
    Alert,
    TouchableWithoutFeedback,
} from 'react-native';

import {
    List, Text, Icon
} from 'react-native-elements';

import PoolListItem from './PoolListItem';
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from 'react-native-menu';
import {grey300, } from './color';

const { width, height } = Dimensions.get("window");

export default class PoolList extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
    }

    onPressPoolItem(pool) {
        this.props.onPressPoolItem(pool);
    }

    onPressMore(pool) {
    }

    render() {
        return(
            <TouchableWithoutFeedback delayPressIn={0} onPressIn={()=> this.refs.popupMenu.closeMenu()}>
            <ScrollView style={styles.container} >
                <View>
                    <List>
                        {
                            this.props.pools.map((pool, i) => (
                                <PoolListItem
                                    key={i}
                                    title={pool.name}
                                    avatar={require('../../img/icon_pool.png')}
                                    subtitle={pool.serialnumber}
                                    onPress={() => this.onPressPoolItem(pool)}
                                    underlayColor={grey300}
                                    rightIcon={{name:'more-vert', onPress: () => this.onPressMore(pool)}}
                                    style={{flexDirection:'row'}}
                                >
                                </PoolListItem>
                            ))
                        }
                    </List>
                </View>

                {/*<View>*/}
                {/*<MenuContext ref={'popupMenu'}>*/}

                        {/*<Menu onSelect={(value) => Alert.alert(`User selected the number ${value}`)}>*/}
                            {/*<MenuTrigger>*/}
                                {/*<Text style={{ fontSize: 20 }}>&#8942;</Text>*/}
                            {/*</MenuTrigger>*/}
                            {/*<MenuOptions>*/}
                                {/*<MenuOption value={1}>*/}
                                    {/*<Text>One</Text>*/}
                                {/*</MenuOption>*/}
                                {/*<MenuOption value={2}>*/}
                                    {/*<Text>Two</Text>*/}
                                {/*</MenuOption>*/}
                            {/*</MenuOptions>*/}
                        {/*</Menu>*/}
                {/*</MenuContext>*/}
                {/*</View>*/}
            </ScrollView>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }

});