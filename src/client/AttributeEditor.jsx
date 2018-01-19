import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Card, {CardHeader, CardContent} from 'material-ui/Card';
import Input, {InputAdornment} from 'material-ui/Input';
import {FormControl, FormControlLabel, FormHelperText, FormLabel} from 'material-ui/Form';
import InvertColors from 'material-ui-icons/InvertColors';
import InvertColorsOff from 'material-ui-icons/InvertColorsOff';
import IconButton from 'material-ui/IconButton';
import Select from 'material-ui/Select';
import Switch from 'material-ui/Switch';
import {GithubPicker} from 'react-color';

import SingleConnectedNode from './gme/BaseComponents/SingleConnectedNode';

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
        value: this.props.value,
        picking: false
    };

    options = {};

    componentWillReceiveProps(nextProps) {
        this.setState({value: nextProps.value, picking: false});
    }

    onColorChange = (color) => {
        let {onChange, onFullChange, value} = this.props;

        if (color.hex !== value) {
            if (typeof onChange === 'function') {
                onChange(color.hex);
            }
            if (typeof onFullChange === 'function') {
                onFullChange(color.hex);
            }
            this.setState({value: color.hex, picking: false});
        }
        this.setState({picking: false});
    };

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
            default:
                return null;
        }
    };

    onKeyPress = (event) => {
        if (this.props.type !== AttributeTypes.color) {
            if (event.charCode === 13 && typeof this.props.onFullChange === 'function' &&
                event.target.value !== this.props.value) {
                this.props.onFullChange(event.target.value);
            }
            this.setState({value: event.target.value});
        }
    };

    onFocus = () => {
        if (this.props.type === AttributeTypes.color)
            this.setState({picking: true});
    };

    onBlur = (event) => {
        if (this.props.type !== AttributeTypes.color) {
            if (typeof this.props.onFullChange === 'function' && !this.options.onlyEnter &&
                event.target.value !== this.props.value) {
                this.props.onFullChange(event.target.value);
            }
            this.setState({value: event.target.value});
        }
    };

    processProps = () => {
        this.options = this.props.options || {};
        if (typeof this.options.readOnly !== 'boolean') {
            this.options.readOnly = false;
        }
    };

    getContent = () => {
        let self = this,
            {readOnly} = this.options,
            {type, values} = this.props,
            {value, picking} = this.state;

        if (values && values.length > 0) {
            // enum case
            return (<Select disabled={readOnly} native={true} value={value} onChange={this.onChange}>
                {values.map(option => (<option key={option}>{option}</option>))}
            </Select>);
        }

        switch (type) {
            case AttributeTypes.boolean:
                return (<FormControlLabel
                    disabled={readOnly}
                    control={<Switch checked={value} onChange={this.onChange}/>}
                />);
            case AttributeTypes.string:
                return (<Input
                    disabled={readOnly}
                    value={value}
                    onChange={this.onChange}
                    onKeyPress={this.onKeyPress}
                    onBlur={this.onBlur}/>);
            case AttributeTypes.number:
                return (<Input
                    disabled={readOnly}
                    type={'number'}
                    value={value}
                    onChange={this.onChange}
                    onKeyPress={this.onKeyPress}
                    onBlur={this.onBlur}/>);
            case AttributeTypes.color:
                let content = [];
                content.push(<Input
                    key={'input'}
                    value={this.state.value}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={() => {
                                self.setState({picking: !picking});
                            }}>
                                {picking ? <InvertColorsOff/> :
                                    <InvertColors nativeColor={value}/>}
                            </IconButton>
                        </InputAdornment>
                    }/>);
                if (picking) {
                    content.push(<GithubPicker
                        key={'picker'}
                        color={this.state.value}
                        onChange={self.onColorChange}/>);
                }
                return content;
            default:
                return null;
        }
    };

    render() {
        this.processProps();
        let content = this.getContent();

        return (<FormControl fullWidth={false} onBlur={this.onBlur} onFocus={this.onFocus}>
            <FormLabel>{this.props.name}</FormLabel>
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
                default:
                    type = AttributeTypes.string;
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