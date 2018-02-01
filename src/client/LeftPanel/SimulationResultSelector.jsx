import React, {Component} from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import {connect} from 'react-redux';

import SIM_RES from './SIM_RES.json';
import {addPlotVariable, removePlotVariable} from '../actions';

const mapStateToProps = state => {
    return {}
};

const mapDispatchToProps = dispatch => {
    return {
        addPlotVariable: varName => {
            dispatch(addPlotVariable(varName));
        },
        removePlotVariable: varName => {
            dispatch(removePlotVariable(varName));
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
        if (true) {
            this.props.addPlotVariable(varName);
        } else {
            this.props.removePlotVariable(varName);
        }
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