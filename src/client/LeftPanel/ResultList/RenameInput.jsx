import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';

export default class RenameInput extends Component {
    static propTypes = {
        initialValue: PropTypes.string.isRequired,
        onDone: PropTypes.func.isRequired,
    }

    state = {
        value: this.props.initialValue,
    };

    render() {
        return (
            <TextField
                ref={(input) => { this.nameInput = input; }}
                id="with-placeholder"
                label={this.props.initialValue}
                placeholder="Enter new name"
                margin="normal"
                onChange={event => this.setState({value: event.target.value})}
                onClick={event => event.stopPropagation()}
                onBlur={() => this.props.onDone(!this.state.value, this.state.value)}
                onKeyPress={(event) => {
                    if (event.charCode === 13) {
                        // Enter was pressed
                        this.props.onDone(!this.state.value, this.state.value);
                    } else if (event.charCode === 27) {
                        // Esc was pressed
                        this.props.onDone(true);
                    }
                }}
            />
        );
    }
}
