import { StyleSheet } from 'react-native';
import {grey500} from '../color';
export default StyleSheet.create({
    container: {
        flex: 1,
        padding: 5
    },
    cell: {
        flex: 1,
        borderColor: 'darkgray',
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: grey500,
    },
    headerCell: {
        flex: 1,
        textAlign: 'center',
        lineHeight: 30,
        fontSize: 26,
        paddingTop: 7,
        color: '#e2e2e2'
    },
    row: {
        flex: 1,
        flexDirection: 'row',
    },
    altRow: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'lightblue'
    },
    contentCell: {
        textAlign: 'center'
    },
    sortedCell: {
        color: 'grey'
    },
    unsortedCell: {
        color: 'grey'
    }
});