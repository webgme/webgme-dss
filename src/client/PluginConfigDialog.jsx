import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';

import {AttributeItem, AttributeTypes} from './AttributeEditor';

const testConfig = [
    {
        "name": "species",
        "displayName": "Animal Species",
        "regex": "^[a-zA-Z]+$",
        "regexMessage": "Name can only contain English characters!",
        "description": "Which species does the animal belong to.",
        "value": "Horse",
        "valueType": "string",
        "readOnly": false
    },
    {
        "name": "age",
        "displayName": "Age",
        "description": "How old is the animal.",
        "value": 3,
        "valueType": "number",
        "minValue": 0,
        "maxValue": 10000,
        "readOnly": false,
        "writeAccessRequired": true
    },
    {
        "name": "carnivore",
        "displayName": "Carnivore",
        "description": "Does the animal eat other animals?",
        "value": false,
        "valueType": "boolean",
        "readOnly": false
    },
    {
        "name": "isAnimal",
        "displayName": "Is Animal",
        "description": "Is this animal an animal? [Read-only]",
        "value": true,
        "valueType": "boolean",
        "readOnly": true
    },
    {
        "name": "classification",
        "displayName": "Classification",
        "description": "",
        "value": "Vertebrates",
        "valueType": "string",
        "valueItems": [
            "Vertebrates",
            "Invertebrates",
            "Unknown"
        ]
    },
    {
        "name": "color",
        "displayName": "Color",
        "description": "The hex color code for the animal.",
        "readOnly": false,
        "value": "#FF0000",
        "regex": "^#([A-Fa-f0-9]{6})$",
        "valueType": "string"
    },
    {
        "name": "file",
        "displayName": "File",
        "description": "",
        "value": "",
        "valueType": "asset",
        "readOnly": false
    }
];

export default class PluginConfigDialog extends Component {
    static propTypes = {
        // configDescriptor: PropTypes.array.isRequired,
        onReady: PropTypes.func.isRequired,
        onCancel: PropTypes.func
    };

    state = {
        configItems: {}
    };

    constructor(props) {
        super(props);
        testConfig.forEach((descriptor) => {
            this.state.configItems[descriptor.name] = descriptor.value;
        });
    }

    onReady = () => {
        this.props.onReady(this.state);
    };

    onChange = (what, how) => {
        let update = {};
        update[what] = how;
        this.setState('configItems', update);
    };

    render() {
        let form = testConfig.map((descriptor) => {

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
                <DialogTitle>Plugin Configuration</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Before executing the plugin, please set the available configuration appropriately.
                    </DialogContentText>
                    {form}
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onReady} color='primary'>Save & Run</Button>
                    {typeof this.props.onCancel === 'function' ?
                        <Button onClick={this.props.onCancel} color='secondary'>Cancel</Button> : ''}
                </DialogActions>
            </Dialog>
        );
    }
};