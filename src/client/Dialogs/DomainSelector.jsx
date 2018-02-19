import React, {Component} from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import {
    FormLabel,
    FormControl,
    FormGroup,
    FormControlLabel,
    FormHelperText,
} from 'material-ui/Form';
import Button from 'material-ui/Button';
import Checkbox from 'material-ui/Checkbox';
import seedInfo from '../../seeds/Modelica/metadata.json';

import getIndexedName from '../gme/utils/getIndexedName';
import AttributeItem from '../RightPanel/AttributeItem';

export default class DomainSelector extends Component {
    static propTypes = {
        domains: PropTypes.arrayOf(PropTypes.string).isRequired,
        showDomainSelection: PropTypes.bool.isRequired,
        defaultName: PropTypes.string,
        takenNames: PropTypes.arrayOf(PropTypes.string),
        title: PropTypes.string.isRequired,
        onOK: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    static defaultProps = {
        defaultName: null,
        takenNames: [],
    };

    state = {
        selected: {},
    };

    componentWillMount() {
        const {domains, defaultName, takenNames} = this.props;
        const selected = {};

        if (typeof defaultName === 'string') {
            this.name = getIndexedName(defaultName, takenNames);
        }

        if (domains) {
            seedInfo.domains.forEach((domain) => {
                selected[domain] = domains.includes(domain);
            });
            this.setState({selected});
        }
    }

    onOKClick = () => {
        // TODO: Populate these correctly
        const {onOK} = this.props;
        onOK({
            name: this.name,
            domains: Object.keys(this.state.selected)
                .filter(domain => this.state.selected[domain]),
        });
    };

    handleCheckChange = domainName => (event, checked) => {
        this.setState({
            selected: update(this.state.selected, {
                [domainName]: {$set: checked},
            }),
        });
    };

    render() {
        const {
            defaultName, showDomainSelection, title, onCancel,
        } = this.props;
        const {selected} = this.state;

        let form = null;
        let nameInput = null;

        if (defaultName === 'string') {
            nameInput = (<AttributeItem
                value={this.name}
                onChange={(newValue) => {
                    // FIXME: Should name really be a field of the instance?
                    this.name = newValue.trim();
                }}
                name="Name"
                type="string"
            />);
        }

        if (showDomainSelection) {
            form = (
                <FormControl component="fieldset">
                    <FormLabel component="legend">Select Domains</FormLabel>
                    <FormGroup>
                        {seedInfo.domains.map(domain => (
                            <FormControlLabel
                                key={domain}
                                control={
                                    <Checkbox
                                        checked={selected[domain]}
                                        onChange={this.handleCheckChange(domain)}
                                        value={domain}
                                    />
                                }
                                label={domain}
                            />))}
                    </FormGroup>
                    <FormHelperText>You&#39;ll need at least one</FormHelperText>
                </FormControl>);
        }

        return (
            <Dialog open>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent style={{display: 'flex'}}>
                    {form}
                    {nameInput}
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onOKClick} color="primary">OK</Button>
                    <Button
                        onClick={() => {
                            onCancel();
                        }}
                        color="secondary"
                    >Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
