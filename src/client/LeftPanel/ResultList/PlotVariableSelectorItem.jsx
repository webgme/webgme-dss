import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';


export default class PlotVariableSelectorItem extends Component {
    static propTypes = {
        nodeData: PropTypes.shape({
            name: PropTypes.string,
        }).isRequired,
        addPlotVariable: PropTypes.func.isRequired,
        removePlotVariable: PropTypes.func.isRequired,
        selectedVariables: PropTypes.arrayOf(PropTypes.string).isRequired,
    };

    onSelectVariable = (event, checked) => {
        const {nodeData} = this.props;

        if (checked) {
            this.props.addPlotVariable(nodeData.id);
        } else {
            this.props.removePlotVariable(nodeData.id);
        }
    };

    render() {
        const {nodeData, selectedVariables} = this.props;
        const varName = nodeData.name;
        const isChecked = selectedVariables.includes(nodeData.id);

        // TODO: Style me
        return (
            <FormControlLabel
                style={{height: 28}}
                control={
                    <Checkbox
                        style={{height: 30}}
                        checked={isChecked}
                        onChange={this.onSelectVariable}
                        value={varName}
                    />
                }
                label={varName}
            />);
    }
}
