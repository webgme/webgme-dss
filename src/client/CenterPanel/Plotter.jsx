import React, {Component} from 'react';
import {connect} from 'react-redux';
import colorHash from '../gme/utils/colorHash';

import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

const mapStateToProps = state => ({
    variables: state.plotData.variables,
    simRes: state.plotData.simRes,
});

const mapDispatchToProps = dispatch => ({});

class Plotter extends Component {
    render() {
        let data = [];
        const {variables, simRes} = this.props;

        if (simRes.timeSeries) {
            simRes.timeSeries.time.forEach((time, idx) => {
                const plotPoints = {
                    time,
                };

                variables.forEach((varName) => {
                    // TODO: Consider rounding the data before storing in model..
                    plotPoints[varName] = parseFloat(simRes.timeSeries[varName][idx].toFixed(9));
                });

                data.push(plotPoints);
            });
        } else {
            data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => ({time: t}));
        }

        return (
            <div>
                <LineChart width={600} height={270} data={data} style={{left: '25%', marginTop: 15, marginBottom: 15}}>
                    <XAxis dataKey="time" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend layout="vertical" align="left" verticalAlign="middle" />
                    {data[0] ?
                        Object.keys(data[0])
                            .filter(varName => varName !== 'time' || variables.length === 0)
                            .map((varName) => {
                                let name = varName;
                                if (varName === 'time') {
                                    name = 'Time is the master...';
                                }
                                return <Line dot={false} name={name} key={varName} type="monotone" dataKey={varName} stroke={colorHash(varName).rgb} />;
                            })
                        : null}
                </LineChart>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Plotter);
