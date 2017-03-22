import React, {Component} from 'react';
import {
    Alert,
    View,
    StyleSheet,
    Dimensions,
    ListView,
    ScrollView,
} from 'react-native';

import {Text, Icon, Button} from 'react-native-elements';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import CalendarPicker from 'react-native-calendar-picker';
import Modal from 'react-native-modalbox';
import DataTable from './common/DataTable/dataTable';
import store from '../store';
import api from '../api';
import Logo from './common/Logo';
import {yellow600, blue900, grey300, blue400, green800, red400} from './common/color';
import LoadingIndicator from './common/LoadingIndicator';

import { StockLine } from 'react-native-pathjs-charts'

const { width, height } = Dimensions.get("window");
const HA_POLL_INTERVAL_MS = 10000;


function getMuranoErrorText() {
    return `Murano Error: It appears this serial number was either not
    added as a device, this device was not activated, the product was
    not associated with this solution, or the device has not written
    to the platform.`;
}

function epoch_to_date(sec, rfc) {
    let d = new Date(0); // The 0 there is the key, which sets the date to the epoch
    d.setUTCSeconds(sec);
    let result = null;
    if (rfc == true)
        result = d;
    else
    if (window.innerWidth < 600)
        result = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    else
        result = d;
    return result
}

var talble_fields = [{
    label: 'Timestamp',
}, {
    label: 'Reading'
}];

export default class Sensor extends Component {
    constructor(props) {
        super(props);

        this.date = new Date();
        this.date.setHours(0, 0, 0, 0);
        switch (this.props.alias) {
            case 'pH':
                this.name = 'PH';
                this.unit = 'PH';
                break;
            case 'ORP':
                this.name = 'REDOX';
                this.unit = 'mV';
                break;
            case 'Temperature':
                this.name = 'Temperature';
                this.unit = '°C';
                break;
            case 'Flow':
                this.name = 'Flow';
                this.unit = 'm\xB3/Hr';
                break;
        }

        this.state = {
            values: null,
            date: this.date,
            timeoutId: null,
        };
    }

    componentWillMount() {
        this.mounted = true;
        this.pollSensorData();
    }

    componentWillUnmount() {
        this.mounted = false;
        clearTimeout(this.state.timeoutId);
    }

    pollSensorData() {
        let start_time = this.state.date.toISOString();
        let tmp = new Date();
        tmp.setDate(this.state.date.getDate() + 1);
        tmp.setHours(0, 0, 0, 0);
        let end_time = tmp.toISOString();
        // this.setState({values: null});
        api.getPoolData(this.props.serialNumber, this.props.alias, start_time, end_time)
            .then(response => this.handlePoolApiResponse(response))
            .catch(err => {
                clearTimeout(this.state.timeoutId);
                // Alert.alert(err.toString());
                this.props.navigator.popToTop();
                // if (!this.mounted) return;
                // this.values = null;
                // this.timeoutId = null;
                // this.setState({
                //     errorText: err.toString(),
                //     values: null,
                //     timeoutId: null,
                // })
            });
    }

    handlePoolApiResponse(response  ) {
        if (!this.mounted) return;

        const timeoutId = setTimeout(() => this.pollSensorData(), HA_POLL_INTERVAL_MS);
        const val_list = response.payload;
        if (response.status === 304)
            this.setState({
                // errorText: null,
                timeoutId
            });
        else{
            this.setState({
                // errorText: null,
                values: val_list,
                timeoutId
            });
        }
    }

    onSelectDate() {
        clearTimeout(this.state.timeoutId);
        this.setState({date: this.date, values: null}, () => {
            this.refs.calendarModal.close();
            this.pollSensorData();
        });


    }
    renderMainContent() {

        var dataSource = new ListView.DataSource({
            rowHasChanged: (r1, r2) => r1 !== r2,
        });

        let chart_data = [];
        let chart_options = {};
        if(this.state.values !=null && this.state.values.length > 0 ) {
            dataSource = dataSource.cloneWithRows(this.state.values.map((val) => {
                let d = new Date(0);
                d.setUTCSeconds(val[0]);
                return [(d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds(), val[1]];

            }));
            chart_data=[this.state.values,];
            chart_options = {
                width: 280,
                height: 280,
                color: '#2980B9',
                margin: {
                    top: 20,
                    left: 45,
                    bottom: 25,
                    right: 20
                },
                animate: {
                    type: 'delayed',
                    duration: 200
                },
                // showAreas: false,
                axisX: {
                    showAxis: true,
                    showLines: true,
                    showLabels: true,
                    showTicks: false,
                    zeroAxis: false,
                    orient: 'bottom',
                    tickCount: 5,
                    labelFunction: ((v) => {
                        let d= new Date(0);
                        d.setUTCSeconds(v);
                        let min = d.getMinutes();
                        let minString = min < 10 ? '0' + min : min;
                        return d.getHours() + ":" + minString;
                    }),
                    label: {
                        fontFamily: 'Arial',
                        fontSize: 14,
                        fontWeight: true,
                        fill: '#34495E'
                    },
                },
                axisY: {
                    showAxis: true,
                    showLines: true,
                    showLabels: true,
                    showTicks: false,
                    zeroAxis: false,
                    orient: 'left',
                    label: {
                        fontFamily: 'Arial',
                        fontSize: 14,
                        fontWeight: true,
                        fill: '#34495E'
                    }
                }
            }

        }




        return (
            <ScrollableTabView>
                <View tabLabel='Graph' style={{flex: 1,alignItems: 'center', justifyContent: 'center'}}>
                    {this.state.values == null ?
                        <LoadingIndicator center={false}/> :
                        this.state.values.length > 0 ?
                            <StockLine data={chart_data}
                                       options={chart_options}
                                       xKey='0'
                                       yKey='1'
                            /> : <Text style={{marginTop: 10}} h3>No Data</Text>
                    }
                </View>

                <ScrollView tabLabel='Table'>
                    {this.state.values == null ?
                        <LoadingIndicator center={false}/> :
                        this.state.values.length > 0?
                            <DataTable
                                dataSource={dataSource}
                                fields={talble_fields}
                            />: <Text style={{marginTop: 10}} h3>No Data</Text>
                    }
                </ScrollView>
            </ScrollableTabView>
        );
    }

    showCalendar() {
        this.refs.calendarModal.open();
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
                    <Text h4 style={styles.headerText}>{this.props.poolName} - {this.name}</Text>
                </View>
                <View style={{flexDirection: 'row'}}>
                    <View style={styles.calendar}>
                        <Icon name="date-range"
                              color={blue900}
                              size={40}
                              onPress={() => this.showCalendar()}
                        />
                        <Text h4 style={styles.dateText}>{(this.state.date.getMonth() + 1) + "/" + this.state.date.getDate() + "/" + this.state.date.getFullYear()}</Text>
                    </View>
                </View>

                {this.renderMainContent()}

                <Modal style={styles.modal_calendar}
                       ref={"calendarModal"}
                >
                    <View style={{alignItems:'center', flex: 1}}>
                        <CalendarPicker
                            selectedDate={this.state.date}
                            onDateChange={(date) => this.date = date}
                            screenWidth={100}
                            selectedBackgroundColor={'#5ce600'} />
                    </View>
                    <View style={{flexDirection: "row", alignSelf:'flex-end', paddingBottom: 10}}>
                        <Button
                            title="Cancel"
                            backgroundColor={yellow600}
                            color={blue900}
                            fontSize={18}
                            raised
                            activeOpacity={0.5}
                            onPress={() => this.refs.calendarModal.close()}

                        />
                        <Button
                            title="OK"
                            backgroundColor={yellow600}
                            color={blue900}
                            fontSize={18}
                            raised
                            activeOpacity={0.5}
                            onPress={() => this.onSelectDate()}
                        />
                    </View>
                </Modal>
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
    calendar: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 10,
        marginRight: 20,
        justifyContent: 'flex-end',
        alignItems: 'center'

    },
    dateText: {
        color: blue900,
        borderBottomWidth: 1,
        borderBottomColor: "#CCC"
    },
    modal_calendar: {
        // marginTop: 30,
        // justifyContent: 'center',
        // alignItems: 'center',
        height: 380,
        width: width,
    },

});