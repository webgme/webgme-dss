import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Card, {CardHeader, CardContent} from 'material-ui/Card';
import Input, {InputLabel, InputAdornment} from 'material-ui/Input';
import {FormControl, FormHelperText} from 'material-ui/Form';
import InvertColors from 'material-ui-icons/InvertColors';
import InvertColorsOff from 'material-ui-icons/InvertColorsOff';
import IconButton from 'material-ui/IconButton';
import {ChromePicker} from 'react-color';
import Select from 'material-ui/Select';

import SingleConnectedNode from './gme/BaseComponents/SingleConnectedNode';

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
            picker = <ChromePicker viscolor={this.state.value} onChange={this.onColorChange}/>;
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

export const AttributeTypes = {
    'string': 'string',
    'number': 'number',
    'color': 'color',
    'boolean': 'boolean',
    'asset': 'asset'
};

export class AttributeItem extends Component {
    static propTypes = {
        onChange: PropTypes.func,
        onFullChange: PropTypes.func,
        value: PropTypes.any.isRequired,
        values: PropTypes.array,
        options: PropTypes.object,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        type: PropTypes.string.isRequired
    };

    state = {
        value: this.props.value
    };

    options = {};

    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value});
    }

    onChange = (event) => {
        let {type, onChange, onFullChange, value, values} = this.props;

        switch (type) {
            case AttributeTypes.boolean:
                if (typeof onChange === 'function')
                    onChange(!value);
                if (typeof onFullChange === 'function')
                    onFullChange(!value);
                break;
            case AttributeTypes.string:
            case AttributeTypes.asset:
                if (event.target.value !== value) {
                    if (typeof onChange === 'function')
                        onChange(event.target.value);

                    if (values && values.length > 0 && typeof onFullChange === 'function')
                        onFullChange(event.target.value);
                }
                this.setState({value: event.target.value});
                break;
            case AttributeTypes.number:
                if (Number(event.target.value) !== value) {
                    if (typeof onChange === 'function')
                        onChange(Number(event.target.value));

                    if (values && values.length > 0 && typeof onFullChange === 'function')
                        onFullChange(Number(event.target.value));
                }
                this.setState({value: event.target.value});
                break;
        }
    };

    onKeyPress = (event) => {
        if (event.charCode === 13 && typeof this.props.onFullChange === 'function' &&
            event.target.value !== this.props.value) {
            this.props.onFullChange(event.target.value);
        }
        this.setState({value: event.target.value});
    };

    onBlur = (event) => {
        if (typeof this.props.onFullChange === 'function' && !this.options.onlyEnter &&
            event.target.value !== this.props.value) {
            this.props.onFullChange(event.target.value);
        }
        this.setState({value: event.target.value});
    };

    processProps = () => {
        this.options = this.props.options || {};
        if (typeof this.options.readOnly !== 'boolean') {
            this.options.readOnly = false;
        }
    };

    getContent = () => {
        let {readOnly} = this.options,
            {type, values} = this.props,
            {value} = this.state;

        if (readOnly) {
            return <Input value={this.state.value}/>;
        }

        if (values && values.length > 0) {
            // enum case
            return (<Select native={true} value={value} onChange={this.onChange}>
                {values.map(option => (<option>{option}</option>))}
            </Select>);
        }

        switch (type) {
            case AttributeTypes.boolean:
                return (<Select native={true} value={value + ''} onChange={this.onChange}>
                    <option value={true}>true</option>
                    <option value={false}>false</option>
                </Select>);
            case AttributeTypes.string:
                return (
                    <Input value={value} onChange={this.onChange} onKeyPress={this.onKeyPress} onBlur={this.onBlur}/>);
            case AttributeTypes.number:
                return (<Input type={'number'} value={value} onChange={this.onChange} onKeyPress={this.onKeyPress}
                               onBlur={this.onBlur}/>);
        }
    };

    render() {
        this.processProps();
        let content = this.getContent();

        return (<FormControl fullWidth={true} onFocus={this.onFocus} onBlur={this.onBlur}>
            <InputLabel>{this.props.name}</InputLabel>
            {content}
            <FormHelperText>{this.props.description}</FormHelperText>
        </FormControl>);
    }

    // render() {
    //     this.processProps();
    //     let content = this.getContent();
    //     return (
    //         <Grid container={true} spacing={0}>
    //             <Grid item={true} xs={2} style={{height: '35px'}}><Paper
    //                 style={{height: '100%', textAlign: 'bottom'}}>{this.props.name}</Paper></Grid>
    //             <Grid item={true} xs={4} style={{height: '35px'}}>
    //                 <Paper style={{height: '100%'}}>{content}</Paper>
    //             </Grid>
    //             <Grid item={true} xs={6} style={{height: '35px'}}>
    //                 <Paper style={{
    //                     fontSize: '20px',
    //                     height: '100%',
    //                     textAlign: 'bottom',
    //                     overflow: 'scroll'
    //                 }}>
    //                     {this.props.description || ''}
    //                 </Paper>
    //             </Grid>
    //         </Grid>
    //     )
    // }
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
            self = this,
            node = this.props.gmeClient.getNode(this.props.activeNode);

        if (!this.state.loaded || node === null) {
            return (<div>Loading node in Attribute Editor ...</div>);
        }

        attributes = this.state.attributes.map((attribute) => {
            let onChangeFn = (newValue) => {
                self.somethingChanges(attribute.name, newValue);
            }, options, type;

            switch (attribute.type) {
                case 'string':
                case 'boolean':
                case 'asset':
                    type = attribute.type;
                    break;
                case 'integer':
                case'float':
                    type = AttributeTypes.number;
                    break;
            }

            return (<AttributeItem
                key={attribute.name}
                value={attribute.value}
                name={attribute.name}
                type={type}
                values={attribute.enum}
                description={attribute.description}
                options={options}
                onFullChange={onChangeFn}/>);
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