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
import store from '../store';
import api from '../api';
import Logo from './common/Logo';
import {yellow600, blue900, grey300, blue400, green800, red400} from './common/color';
import LoadingIndicator from './common/LoadingIndicator';
import DataTable from './common/DataTable';
import { SmoothLine } from 'react-native-pathjs-charts'

const { width, height } = Dimensions.get("window");
const HA_POLL_INTERVAL_MS = 30000;


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

export default class Sensor extends Component {
    constructor(props) {
        super(props);

        let errorText = null;
        let values = null;
        const date = new Date();
        date.setHours(0, 0, 0, 0);
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
            errorText,
            values,
            itemCount : 30,
            date: date,
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
                clearTimeout(this.timeoutId);
                if (!this.mounted) return;
                this.values = null;
                this.timeoutId = null;
                this.setState({
                    errorText: err.toString(),
                    values: null,
                    timeoutId: null,
                })
            });
    }

    handlePoolApiResponse(response) {
        if (!this.mounted) return;
        // Re-draw every 10 sec
        const timeoutId = setTimeout(() => this.pollSensorData(), 1000);
        const val_list = response.payload;
        console.log(val_list);
        if (response.status === 304)
            this.setState({
                errorText: null,
                timeoutId
            });
        else{
            this.setState({
                errorText: null,
                values: val_list,
                timeoutId
            });
        }
    }

    renderMainContent() {
        // let chart_data = null;
        // if (this.values != null){
        //     var time = (new Date()).getTime()
        //     chart_data = this.values.map((val) => {
        //         return {
        //             x: val[0] * 1000,
        //             y: parseFloat(val[1])
        //         };
        //     });
        // }

        let chart_data = null;
        let table_data = null;
        if (this.state.values != null){
            // Convert Epoch seconds value to date value
            // Sample value: [1480572566, "5.75", "", ""]   >>>>  [timestamp, value, user_mail, action]
            chart_data = this.state.values.map((val) => {return [epoch_to_date(val[0], true), parseFloat(val[1])]});
            chart_data = [['Timestamp', this.props.alias], ].concat(chart_data);
            table_data = this.state.values.map((val) => {return [epoch_to_date(val[0]).toString(), val[1]]});
            table_data = table_data.filter(dd => dd[1] != null);
        }


        let data = [
            [{
                "x": 0,
                "y": 3.4
            }, {
                "x": 1,
                "y": 3.9
            }, {
                "x": 2,
                "y": 4
            }, {
                "x": 3,
                "y": 6
            }, {
                "x": 4,
                "y": 7
            },{
                "x": 5,
                "y": 2
            },{
                "x": 6,
                "y": 3
            },{
                "x": 7,
                "y": 10
            },{
                "x": 8,
                "y": 1
            },{
                "x": 9,
                "y": 19
            },{
                "x": 1,
                "y": 3.4
            }, {
                "x": 11,
                "y": 3.9
            }, {
                "x": 12,
                "y": 4
            }, {
                "x": 13,
                "y": 6
            }, {
                "x": 14,
                "y": 7
            },{
                "x": 15,
                "y": 2
            },{
                "x": 16,
                "y": 3
            },{
                "x": 17,
                "y": 10
            },{
                "x": 18,
                "y": 1
            },{
                "x": 19,
                "y": 10
            },]
        ]

        let options = {
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
            axisX: {
                showAxis: true,
                showLines: true,
                showLabels: true,
                showTicks: false,
                zeroAxis: false,
                orient: 'bottom',
                tickCount: 6,
                tickValues: [
                    // {value:'name1'},
                    // {value:'name2'},
                ],
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

        return (
            <ScrollableTabView>
                <View tabLabel='Graph'>
                    {this.state.values == null ?
                        <LoadingIndicator center={false}/> :
                        chart_data.length > 1 ?
                            <SmoothLine data={data} options={options} xKey='x' yKey='y' /> : <Text style={{marginTop: 10}} h3>No Data</Text>
                    }
                </View>

                <ScrollView tabLabel='Table'>
                    {/*{this.values == null ?*/}
                        {/*<LoadingIndicator center={false}/> :*/}
                        {/*this.values.length > 1?*/}
                        {/*<DataTable*/}
                            {/*dataSource={this.values}*/}
                        {/*/> : <Text style={{marginTop: 10}} h3>No Data</Text>*/}
                    {/*}*/}
                    <Text style={{marginTop: 10}} h3>No Data</Text>
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
                        <Text h4 style={styles.dateText}>{this.state.date.toLocaleDateString()}</Text>
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
                            onPress={() => {
                                this.refs.calendarModal.close();
                                this.setState({date: this.date});
                                this.pollSensorData();
                            }}
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