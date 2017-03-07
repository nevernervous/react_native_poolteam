import React, {Component} from 'react'
import {
    Image,
    View,
    ListView,
    Text,
    Dimensions,
    TouchableHighlight,
    Linking,
    LayoutAnimation,
    StyleSheet
} from 'react-native';

class Cell extends Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <Text style={[styles.cell, styles.contentCell, this.props.style]}>
                {this.props.label}
            </Text>
        );
    }
}

Cell.propTypes = {
    label: React.PropTypes.string.isRequired,
    style: React.PropTypes.number,
}

class HeaderCell extends React.Component {
    constructor(props) {
        super(props);

        this.isAscending = false;
        this.hasSorted = false;

        this.onPress = this.onPress.bind(this);
    }

    render() {
        return (
            <TouchableHighlight
                onPress={this.onPress}
                disabled={!this.props.field.sortable}
                underlayColor={this.props.highlightColor}
                style={{ flex: 1, height: 40 }}>
                <Text style={[styles.cell, styles.headerCell, this.props.style]}>
                    {this.props.field.label}
                    {this.renderSortIcons()}
                </Text>
            </TouchableHighlight>
        );
    }

    renderSortIcons() {
        if (!this.props.field.sortable) {
            return null;
        }

        if (!this.props.isSortedField) {
            this.isAscending = false;
            this.hasSorted = false;
        }

        return ([
            <Text key='downArrow' style={this.getCellStyle(false)}>{'\u25BC'}</Text>,
            <Text key='upArrow' style={this.getCellStyle(true)}>{'\u25b2'}</Text>
        ]);

    }

    getCellStyle(isUp) {
        if (!this.hasSorted) {
            return styles.unsortedCell;
        }

        if (isUp) {
            return !this.isAscending ? Style.sortedCell : null
        } else {
            return this.isAscending ? Style.sortedCell : null
        }
    }

    onPress() {
        this.hasSorted = true;
        this.isAscending = !this.isAscending;
        this.props.onSort && this.props.onSort(this.props.field, this.isAscending);
    }
}

HeaderCell.propTypes = {
    field: React.PropTypes.object.isRequired,
    onSort: React.PropTypes.func,
    isSortedField: React.PropTypes.bool,
    style: React.PropTypes.number,
    highlightColor: React.PropTypes.string,
}

export default class DataTable extends Component {
    constructor(props) {
        super(props);

        this.renderHeaderCell = this.renderHeaderCell.bind(this);
        this.renderRow = this.renderRow.bind(this);
        this.onSort = this.onSort.bind(this);

        this.state = {
            sortedField: null
        }
    }

    render() {
        return (
            <View style={[styles.container, this.props.containerStyle]}>
                {this.renderHeader()}
                {this.renderTable()}
            </View>
        )
    }

    renderHeader() {
        return (
            <View style={[styles.header, this.props.headerStyle]}>
                {this.props.fields.map(this.renderHeaderCell)}
            </View>
        );
    }

    renderHeaderCell(field, i) {
        if (this.props.renderHeaderCell) {
            return this.props.renderHeaderCell(field, i);
        }

        return (
            <HeaderCell
                key={i}
                style={this.props.headerCellStyle}
                highlightColor={this.props.headerHighlightColor}
                onSort={this.onSort}
                isSortedField={this.state.sortedField === field}
                field={field} />
        )
    }

    renderTable() {
        return (
            <ListView
                dataSource={this.props.dataSource}
                renderRow={this.renderRow} />
        );
    }

    renderRow(row, sectionId, rowId) {

        var style = rowId % 2 == 0 ? styles.row : styles.altRow

        return (
            <View
                style={style}
                accessible={true}>
                {this.renderCells(row)}
            </View>
        )
    }

    renderCells(row) {
        var keys = Object.keys(row);

        return this.props.fields.map((field, index) => {
            var key = keys[index];

            var value = row[key].toString();

            return (
                <Cell
                    key={index}
                    style={this.props.cellStyle}
                    label={value} />
            );
        });
    }

    onSort(field, isAscending) {
        if (!this.props.onSort) {
            return;
        }

        this.setState({
            sortedField: field
        });
        this.props.onSort(field, isAscending);
    }
}


DataTable.propTypes = {
    fields: React.PropTypes.arrayOf(React.PropTypes.shape({
        label: React.PropTypes.string.isRequired,
        sortable: React.PropTypes.bool
    })),
    onSort: React.PropTypes.func,
    dataSource: React.PropTypes.object.isRequired,
    containerStyle: React.PropTypes.number,
    renderHeaderCell: React.PropTypes.func,
    headerStyle: React.PropTypes.number,
    headerCellStyle: React.PropTypes.number,
    headerHighlightColor: React.PropTypes.string,
    cellStyle: React.PropTypes.number,

}

DataTable.defaultProps = {
    headerHighlightColor: 'gray'
}

const styles = StyleSheet.create({
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
        backgroundColor: 'lightgray'
    },
    headerCell: {
        flex: 1,
        textAlign: 'center',
        lineHeight: 30,
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
    },
    sortedCell: {
        color: 'grey'
    },
    unsortedCell: {
        color: 'grey'
    }
});

