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
import Menu, { MenuContext, MenuOptions, MenuOption, MenuTrigger } from './PopupMenu';
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

    onPressDeletePool(pool) {
        this.props.onPressDeletePool(pool);
    }

    onPressEditPool(pool) {
        this.props.onPressEditPool(pool);
    }

    render() {
        return(
            <MenuContext style={styles.container}>
            <ScrollView >
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
                                    onPressEdit={() => this.onPressEditPool(pool)}
                                    onPressDelete={() => this.onPressDeletePool(pool)}
                                    underlayColor={grey300}
                                    rightIcon={{name:'more-vert'}}
                                    style={{flexDirection:'row', flex: 1}}
                                >
                                </PoolListItem>

                            ))
                        }
                    </List>
                </View>
            </ScrollView>
            </MenuContext>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }

});