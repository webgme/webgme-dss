import React, {Component} from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import {connect} from 'react-redux';

import SIM_RES from './SIM_RES.json';
import {setPlotData} from '../actions';

const mapStateToProps = state => {
    return {}
};

const mapDispatchToProps = dispatch => {
    return {
        setPlotData: (data) => {
            dispatch(setPlotData(data));
        }
    }
};


class SimulationResultSelector extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired
    };

    // state = {
    //     selectedVariables: {}
    // };

    onSelectVariable = (varName) => (event) => {
        let plotData = [];

        // this.setState({
        //     selectedVariables: update(this.state.selectedVariables, {
        //         [varName]: {$set: true}
        //     })
        // });

        SIM_RES.timeSeries.time.map((time, idx) => {
            plotData.push({
                time: time,
                [varName]: SIM_RES.timeSeries[varName][idx]
            });
        });

        this.props.setPlotData(plotData);
    };

    render() {
        return (
            <ul>
                {Object.keys(SIM_RES.variables).map(varName => {
                    return <li key={varName} onClick={this.onSelectVariable(varName)}>{varName}</li>;
                })}
            </ul>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SimulationResultSelector);