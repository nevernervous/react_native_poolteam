import React, {Component} from 'react';
import {
    View,
    ListView,
    Text,
    StyleSheet
} from 'react-native';

export default class DataTable extends Component {
    constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows(['row 1', 'row 2']),
        };
    }

    render() {
        return(
            <View style={{marginTop:30}}>
            <ListView
                style={styles.container}
                dataSource={this.state.dataSource}
                renderRow={(rowData) => <Text>{rowData}</Text>}
            >
            </ListView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20,
    },
});