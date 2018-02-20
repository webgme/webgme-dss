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
        selected: (() => {
            const {domains} = this.props;
            const selected = {};

            if (domains) {
                seedInfo.domains.forEach((domain) => {
                    selected[domain] = domains.includes(domain);
                });
            }

            return selected;
        })(),
        name: typeof this.props.defaultName === 'string' ?
            getIndexedName(this.props.defaultName, this.props.takenNames) : '',
    };

    onOKClick = () => {
        const {onOK} = this.props;
        const {selected, name} = this.state;

        onOK({
            name,
            domains: Object.keys(selected).filter(domain => selected[domain]),
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

        const {selected, name} = this.state;

        let form = null;
        let nameInput = null;

        if (typeof defaultName === 'string') {
            nameInput = (<AttributeItem
                value={name}
                onChange={(newValue) => {
                    this.setState({name: newValue});
                }}
                name="Name"
                type="string"
                invalidChars={/[^\w]/gi}
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
