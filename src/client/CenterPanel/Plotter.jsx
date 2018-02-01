import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import SIM_RES from '../LeftPanel/SIM_RES.json';

import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

const mapStateToProps = state => {
    return {
        variables: state.plotData.variables
    }
};

const mapDispatchToProps = dispatch => {
    return {}
};
// SIM_RES.timeSeries.time.map((time, idx) => {
//     plotData.push({
//         time: time,
//         [varName]: SIM_RES.timeSeries[varName][idx]
//     });
// });
class Plotter extends Component {
    render() {
        const data = [];
        console.log('Plotter got variables', this.props.variables);
        return (
            <div>
                <LineChart width={900} height={600} data={data}
                           margin={{top: 100, right: 30, left: 150, bottom: 5}}>
                    <XAxis dataKey="time"/>
                    <YAxis/>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <Tooltip/>
                    <Legend />
                    {data[0] ?
                        Object.keys(data[0])
                            .filter(varName => varName !== 'time')
                            .map(varName => {
                                return <Line key={varName} type="monotone" dataKey={varName} stroke="#82ca9d" />
                            })
                         : null}
                </LineChart>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Plotter);