import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';

import {AttributeItem, AttributeTypes} from '../RightPanel/AttributeEditor';

export default class PluginConfigDialog extends Component {
    static propTypes = {
        onOK: PropTypes.func.isRequired,
        metadata: PropTypes.object.isRequired,
        fastForward: PropTypes.bool
    };

    state = {
        configItems: {}
    };

    constructor(props) {
        super(props);
        this.props.metadata.configStructure.forEach((descriptor) => {
            this.state.configItems[descriptor.name] = descriptor.value;
        });
    }

    onReady = () => {
        this.props.onOK(this.state);
    };

    onChange = (what, how) => {
        let update = {};
        update[what] = how;
        this.setState('configItems', update);
    };

    componentWillMount() {
        const {metadata, fastForward, onOK} = this.props;

        if (fastForward && metadata.configStructure.length === 0)
            onOK(this.state);
    }

    render() {
        const {metadata} = this.props;

        let form = metadata.configStructure.map((descriptor) => {

            if (descriptor.name.indexOf('color') !== -1) {
                descriptor.valueType = AttributeTypes.color;
            }

            return (<AttributeItem
                key={descriptor.name}
                value={this.state.configItems[descriptor.name]}
                name={descriptor.displayName}
                values={descriptor.valueItems}
                type={descriptor.valueType}
                onChange={(newValue) => {
                    this.onChange(descriptor.name, newValue)
                }}
                description={descriptor.description}
                options={{readOnly: descriptor.readOnly}}/>);
        });

        return (
            <Dialog open={true}>
                <DialogTitle>{metadata.name}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {metadata.description}
                    </DialogContentText>
                    {form}
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onReady} color='primary'>Run</Button>
                    <Button onClick={() => {
                        this.props.onOK()
                    }} color='secondary'>Cancel</Button>
                </DialogActions>
            </Dialog>
        );
    }
};