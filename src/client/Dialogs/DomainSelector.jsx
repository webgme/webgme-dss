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
import Button from 'material-ui/Button'
import Checkbox from 'material-ui/Checkbox';
import seedInfo from '../../seeds/Modelica/metadata.json';

import getIndexedName from '../gme/utils/getIndexedName';
import {AttributeItem} from "../RightPanel/AttributeEditor";


export default class DomainSelector extends Component {
    static propTypes = {
        domains: PropTypes.array.isRequired,
        showDomainSelection: PropTypes.bool,
        defaultName: PropTypes.string,
        takenNames: PropTypes.array,
        title: PropTypes.string,
        onOK: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired
    };

    state = {
        name: null,
        selected: {}
    };

    constructor(props) {
        super(props);

        let {domains, defaultName, takenNames} = props;

        if (defaultName) {
            this.state.name = getIndexedName(defaultName, takenNames);
        }

        if (domains) {
            seedInfo.domains.forEach(domain => {
                this.state.selected[domain] = domains.includes(domain);
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

    handleCheckChange = domainName => (event, checked) => {

        this.forceUpdate();
        this.setState({
            selected: update(this.state.selected, {
                [domainName]: {$set: checked}
            })
        });
    };

    render() {

        let form = null;
        let nameInput = null;

        if (typeof this.props.defaultName === 'string') {
            nameInput = <AttributeItem value={this.state.name}
                                       name={'Name'}
                                       type={'string'}/>
        }

        if (this.props.showDomainSelection) {
            form = (
                <FormControl component="fieldset">
                    <FormLabel component="legend">Select Domains</FormLabel>
                    <FormGroup>
                        {seedInfo.domains.map((domain) => {
                            return (
                                <FormControlLabel key={domain}
                                    control={
                                        <Checkbox
                                            checked={this.state.selected[domain]}
                                            onChange={this.handleCheckChange(domain)}
                                            value={domain}/>
                                    }
                                    label={domain}
                                />)
                        })}
                    </FormGroup>
                    <FormHelperText>You'll need at least one</FormHelperText>
                </FormControl>);
        }

        return (
            <Dialog open={true}>
                <DialogTitle>{this.props.title}</DialogTitle>
                <DialogContent style={{display: 'flex'}}>
                    {form}
                    {nameInput}
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onOKClick} color='primary'>OK</Button>
                    <Button onClick={() => {
                        this.props.onCancel()
                    }} color='secondary'>Cancel</Button>
                </DialogActions>
            </Dialog>
        );
    }
}