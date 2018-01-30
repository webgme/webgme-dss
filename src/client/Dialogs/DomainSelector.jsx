import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button'


export default class DomainSelector extends Component {
    static propTypes = {
        availableDomains: PropTypes.array, // This should come from state
        domains: PropTypes.array.isRequired,
        showDomainSelection: PropTypes.bool,
        defaultName: PropTypes.string,
        onOK: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired
    };

    state = {
        selected: []
    };

    constructor(props) {
        super(props);

        let {availableDomains, domains} = props;

        if (availableDomains && domains) {
            domains.forEach(domain => {
                this.state.selected.push(availableDomains.indexOf(domain));
            });
        }
    }

    onOKClick = () => {
        // TODO: Populate these correctly
        this.props.onOK({
            name: this.props.defaultName,
            domains: []
        });
    };

    render() {
        return (
            <Dialog open={true}>
                <DialogTitle>Select Domains</DialogTitle>
                <DialogContent>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onOKClick} color='primary'>OK</Button>
                    <Button onClick={() => {this.props.onCancel()}} color='secondary'>Cancel</Button>
                </DialogActions>
            </Dialog>
        );
    }
}