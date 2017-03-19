import React, {Component} from 'react';
import {
    Alert,
    View,
    StyleSheet,
    Dimensions,
    ListView,
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

export default class Sensor extends Component {
    constructor(props) {
        super(props);

        let errorText = null;
        this.values = null;
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
            // values,
            itemCount : 30,
            date: date,
            calendarShow: false,
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
                if (!this.mounted) return;
                this.setState({
                    errorText: err.toString(),
                    // values: null,
                    timeoutId: null,
                })
            });
    }

    handlePoolApiResponse(response) {
        if (!this.mounted) return;
        // Re-draw every 10 sec
        const timeoutId = setTimeout(() => this.pollSensorData(), 10000);
        const val_list = response.payload;
        Alert.alert(val_list[0][0]);
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
        if(this.state.calendarShow == false) {
            var Highcharts = 'Highcharts';
            let chart_data = null;
            if (this.state.values != null){
                var time = (new Date()).getTime()
                chart_data = this.state.values.map((val) => {
                    return {
                        x: val[0] * 1000,
                        y: parseFloat(val[1])
                    };
                });
            }
            var conf = {
                chart: {
                    type: 'spline',
                    marginRight: 10,

                },
                title: {
                    text: this.name
                },
                xAxis: {
                    type: 'datetime',
                    tickPixelInterval: 100
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }]
                },
                tooltip: {
                    formatter: function () {
                        return '<b>' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '</b><br/><b>' + Highcharts.numberFormat(this.y, 2); + '</b>';
                    }
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                series: [{
                    name: this.name,
                    data: chart_data
                }],
                credits: {
                    enabled: false
                },
            };

            return (
                <ScrollableTabView>
                    <View tabLabel='Graph'>
                        {this.state.values == null ?
                            <LoadingIndicator center={false}/> :
                            chart_data.length > 1 ?
                            <ChartView style={{marginTop: 10, height: 400}} config={conf}/> : <Text style={{marginTop: 10}} h3>No Data</Text>
                        }
                    </View>

                    <View tabLabel='Table'>
                        {this.state.values == null ?
                            <LoadingIndicator center={false}/> :
                            this.state.values.length > 1?
                            <DataTable
                                dataSource={this.state.values}
                            /> : <Text style={{marginTop: 10}} h3>No Data</Text>
                        }
                    </View>
                </ScrollableTabView>
            );
        }
    }

    showCalendar() {
        this.setState({calendarShow: true})
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

                <Modal style={styles.modal_calendar}
                       ref={"calendarModal"}
                       onClosed={() => this.setState({calendarShow: false})}
                >
                    <View style={{alignItems:'center', flex: 1}}>
                    <CalendarPicker
                        selectedDate={this.state.date}
                        onDateChange={(date) => this.date = date}
                        screenWidth={100}
                        selectedBackgroundColor={'#5ce600'} />
                    </View>
                    <View style={{flexDirection: "row", alignSelf:'flex-end'}}>
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
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
        height: 350,
        width: width,
    },

});