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

/*
"configStructure": [
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
]

*/

export default class PluginConfigDialog extends Component {
    constructor(props) {
        super(props);
        let state = {};

        this.props.configDescriptor.forEach((descriptor) => {
            state[descriptor.name] = descriptor.value;
        });

        this.state = state;

        this.onReady = this.onReady.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onReady() {
        this.props.onReady(this.state);
    }

    onChange(what, how) {
        let update = {};
        update[what] = how;
        this.setState(update);
    }

    render() {
        let form,
            self = this;

        form = this.props.configDescriptor.map((descriptor) => {
            let changeFn = (newValue) => {
                    self.onChange(descriptor.name, newValue)
                },
                options = {readOnly: descriptor.readOnly};

            if (descriptor.name.indexOf('color') !== -1) {
                descriptor.valueType = AttributeTypes.color;
            }

            return (<AttributeItem
                key={descriptor.name}
                value={this.state[descriptor.name]}
                name={descriptor.displayName}
                values={descriptor.valueItems}
                type={descriptor.valueType}
                onChange={changeFn}
                description={descriptor.description}
                options={options}/>);
        });
        return (<Dialog open={true}>
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
                    <Button onClick={this.props.onCancel} color='accent'>Cancel</Button> : ''}
            </DialogActions>
        </Dialog>);
    }
};

PluginConfigDialog.propTypes = {
    configDescriptor: PropTypes.array.isRequired,
    onReady: PropTypes.func.isRequired,
    onCancel: PropTypes.func
};