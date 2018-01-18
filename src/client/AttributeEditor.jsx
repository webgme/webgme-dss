import React, {Component} from 'react';
import PropTypes from 'prop-types';
import TextField from 'material-ui/TextField';
import Card, {CardHeader, CardContent} from 'material-ui/Card';
import Input, {InputLabel, InputAdornment} from 'material-ui/Input';
import {FormControl, FormHelperText} from 'material-ui/Form';
import InvertColors from 'material-ui-icons/InvertColors';
import InvertColorsOff from 'material-ui-icons/InvertColorsOff';
import IconButton from 'material-ui/IconButton';
import {ChromePicker} from 'react-color';

import SingleConnectedNode from './gme/BaseComponents/SingleConnectedNode';

export class LabelItem extends Component {
    render() {
        return (
            <TextField
                label={this.props.name}
                value={this.props.value + ''}
                helperText={typeof this.props.description === 'string' ? this.props.description : ''}
                disabled={true} //TODO show that later we might want to have options here
                fullWidth={true}
            />
        );
    }
}

LabelItem.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    description: PropTypes.string
};

export class EnumItem extends Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
    }

    onChange(event) {
        this.props.onChange(event.target.value);
    }

    render() {
        return (
            <TextField
                select
                label={this.props.name}
                value={this.props.value}
                helperText={this.props.description}
                onChange={this.onChange}
                SelectProps={{native: true}}
                disabled={false} //TODO show that later we might want to have options here
                fullWidth={true}
            >
                {this.props.values.map(option => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </TextField>
        );
    }
}

EnumItem.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.any.isRequired,
    values: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    description: PropTypes.string
};

export class BooleanItem extends Component {
    constructor(props) {
        super(props);

        this.onSelection = this.onSelection.bind(this);
    }

    onSelection(event) {
        this.props.onChange(event.target.value === 'true');
    }

    render() {
        return (
            <TextField
                select
                label={this.props.name}
                value={'' + this.props.value}
                onChange={this.onSelection}
                SelectProps={{native: true}}
                disabled={false} //TODO show that later we might want to have options here
                fullWidth={true}
                helperText={this.props.description}
            >
                <option key={true} value={true}>true</option>
                <option key={false} value={false}>false</option>
            </TextField>
        );
    }
}

BooleanItem.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    description: PropTypes.string
};

export class StringItem extends Component {
    constructor(props) {
        super(props);
        this.options = typeof props.options === 'object' ? props.options : {};
        this.options.isValid = this.options.isValid || function (text) {
            return typeof text === 'string';
        };

        this.state = {value: undefined};

        this.onChange = this.onChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    onChange(event) {
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(event.target.value);
        }
        this.setState({value: event.target.value});
    }

    onKeyPress(event) {
        if (event.charCode === 13 && typeof this.props.onFullChange === 'function') {
            this.props.onFullChange(event.target.value);
            this.setState({value: undefined});
        }
    }

    onBlur(event) {
        if (typeof this.props.onFullChange === 'function' && !this.options.onlyEnter) {
            this.props.onFullChange(event.target.value);
            this.setState({value: undefined});
        }
    }

    render() {
        let text = this.state.value;
        if (text === undefined) {
            text = this.props.value;
        }

        return (
            <TextField
                label={this.props.name}
                value={text}
                disabled={false} //TODO show that later we might want to have options here
                fullWidth={true}
                error={!this.options.isValid(text)}
                helperText={this.props.description}
                onChange={this.onChange}
                onKeyPress={this.onKeyPress}
                onBlur={this.onBlur}
            />
        );
    }
}

StringItem.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onFullChange: PropTypes.func,
    options: PropTypes.object,
    description: PropTypes.string
};

export class NumberItem extends Component {
    constructor(props) {
        super(props);
        this.options = typeof props.options === 'object' ? props.options : {};
        this.options.isValid = this.options.isValid || function (value) {
            return Number(value) + '' === value + ''
        };
        this.state = {value: undefined};

        this.onChange = this.onChange.bind(this);
        this.onKeyPress = this.onKeyPress.bind(this);
        this.onBlur = this.onBlur.bind(this);
    }

    onChange(event) {
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(Number(event.target.value));
        }
        this.setState({value: event.target.value});
    }

    onKeyPress(event) {
        if (event.charCode === 13 && typeof this.props.onFullChange === 'function') {
            this.props.onFullChange(Number(event.target.value));
            this.setState({value: undefined});
        }
    }

    onBlur(event) {
        if (typeof this.props.onFullChange === 'function' && !this.options.onlyEnter) {
            this.props.onFullChange(Number(event.target.value));
            this.setState({value: undefined});
        }
    }

    render() {
        let text = this.state.value;
        if (text === undefined) {
            text = this.props.value;
        }

        return (
            <TextField
                label={this.props.name}
                value={text}
                type={'number'}
                error={!this.options.isValid(Number(text))}
                disabled={false} //TODO show that later we might want to have options here
                fullWidth={true}
                helperText={this.props.description}
                onChange={this.onChange}
                onKeyPress={this.onKeyPress}
                onBlur={this.onBlur}
            />
        );
    }
}

NumberItem.propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func,
    onFullChange: PropTypes.func,
    options: PropTypes.object,
    description: PropTypes.string
};

export class ColorItem extends Component {
    static propTypes = {
        name: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        onChange: PropTypes.func,
        options: PropTypes.object,
        description: PropTypes.string
    };

    state = {value: this.props.value, picking: false};

    onPickerClick = () => {
        let newPicking = !this.state.picking;
        if (!newPicking) {
            this.props.onChange(this.state.value);
        }
        this.setState({picking: newPicking});
    };

    onColorChange = (newColor) => {
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(newColor.hex);
        }
        this.setState({value: newColor.hex});
    };

    onKeyPress(event) {
        if (event.charCode === 13 && typeof this.props.onFullChange === 'function') {
            this.props.onFullChange(event.target.value);
            this.setState({value: undefined});
        }
    }

    onBlur = () => {
        if (typeof this.props.onFullChange === 'function' && !this.options.onlyEnter) {
            this.props.onFullChange(this.state.value);
        }
        this.setState({picking: false});
    };

    onFocus = () => {
        this.setState({picking: true});
    };

    render() {
        let picker;

        if (this.state.picking) {
            picker = <ChromePicker color={this.state.value} onChange={this.onColorChange}/>;
        }

        return (<FormControl fullWidth={true} onFocus={this.onFocus} onBlur={this.onBlur}>
            <InputLabel htmlFor="password">{this.props.name}</InputLabel>
            <Input
                value={this.state.value}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton onClick={this.onPickerClick}>
                            {this.state.picking ? <InvertColorsOff/> : <InvertColors nativeColor={this.state.value}/>}
                        </IconButton>
                    </InputAdornment>
                }
            />
            {picker}
            <FormHelperText>{this.props.description}</FormHelperText>
        </FormControl>);
    }
}

export default class AttributeEditor extends SingleConnectedNode {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            attributes: []
        };

        this.onNodeLoad = this.refreshDescriptor;
        this.onNodeUpdate = this.refreshDescriptor;
        this.somethingChanges = this.somethingChanges.bind(this);
    }

    refreshDescriptor() {
        let nodeObj = this.props.gmeClient.getNode(this.props.activeNode),
            names = nodeObj.getValidAttributeNames(),
            attributes;

        // All children are meta-nodes -> thus available right away
        attributes = names.map((id) => {
            return {
                name: id,
                value: nodeObj.getAttribute(id),
                type: nodeObj.getAttributeMeta(id).type || 'string',
                enum: nodeObj.getAttributeMeta(id).enum || null
            };
        });

        this.setState({
            loaded: true,
            attributes: attributes
        });
    }

    somethingChanges(what, how) {
        console.log('update root:', what, ':', how, ':', typeof how);
        this.props.gmeClient.setAttribute(this.props.activeNode, what, how);
    }

    render() {
        let attributes,
            node = this.props.gmeClient.getNode(this.props.activeNode);

        if (!this.state.loaded || node === null) {
            return (<div>Loading node in Attribute Editor ...</div>);
        }

        attributes = this.state.attributes.map((attribute) => {
            if (attribute.enum !== null) {
                return (
                    <EnumItem key={attribute.name} name={attribute.name} value={attribute.value} values={attribute.enum}
                              onChange={(newValue) => {
                                  this.somethingChanges(attribute.name, newValue);
                              }}/>);
            } else if (attribute.type === 'bool') {
                return <BooleanItem key={attribute.name} name={attribute.name} value={attribute.value}
                                    onChange={(newValue) => {
                                        this.somethingChanges(attribute.name, newValue);
                                    }}/>
            } else if (attribute.type === 'string') {
                return <StringItem key={attribute.name} name={attribute.name} value={attribute.value}
                                   onFullChange={(newValue) => {
                                       this.somethingChanges(attribute.name, newValue);
                                   }}/>
            } else if (attribute.type === 'integer' || attribute.type === 'float') {
                return <NumberItem key={attribute.name} name={attribute.name} value={attribute.value}
                                   onFullChange={(newValue) => {
                                       this.somethingChanges(attribute.name, newValue);
                                   }}/>
            }
            return <LabelItem key={attribute.name} name={attribute.name} value={'' + attribute.value}/>;
        });

        return (
            <Card>
                <CardHeader title={'Attribute editor'} subheader={'GUID: ' + node.getGuid()}/>
                <CardContent>
                    {attributes}
                </CardContent>
            </Card>
        );
    }
}

AttributeEditor.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    activeNode: PropTypes.string.isRequired
};