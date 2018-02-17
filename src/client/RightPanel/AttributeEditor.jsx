import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Card, {CardHeader, CardContent} from 'material-ui/Card';
import Input, {InputAdornment} from 'material-ui/Input';
import {FormControl, FormControlLabel, FormHelperText, FormLabel} from 'material-ui/Form';
import InvertColors from 'material-ui-icons/InvertColors';
import InvertColorsOff from 'material-ui-icons/InvertColorsOff';
import IconButton from 'material-ui/IconButton';
import Typography from 'material-ui/Typography';
import Select from 'material-ui/Select';
import Switch from 'material-ui/Switch';
import {GithubPicker} from 'react-color';
// noinspection JSUnresolvedVariable
import {Samy} from 'react-samy-svg';

import Territory from '../gme/BaseComponents/Territory';
import SVGCACHE from '../../svgcache';

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
        fullWidth: PropTypes.bool,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        unit: PropTypes.string,
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

    eventToAttrValue = (event) => {
        const {type} = this.props;

        switch (type) {
            case AttributeTypes.boolean:
                return event.target.checked;
            case AttributeTypes.string:
            case AttributeTypes.asset:
                return event.target.value;
            case AttributeTypes.number:
                return Number(event.target.value);
            default:
                return null;
        }
    };

    onChange = (event) => {
        let {type, onChange, onFullChange, value, values} = this.props;

        let newValue = this.eventToAttrValue(event);

        switch (type) {
            case AttributeTypes.boolean:
                if (typeof onChange === 'function') {
                    onChange(newValue);
                }

                if (typeof onFullChange === 'function') {
                    onFullChange(newValue);
                }

                this.setState({value: newValue});
                break;
            case AttributeTypes.string:
            case AttributeTypes.asset:
                if (newValue !== value) {
                    if (typeof onChange === 'function') {
                        onChange(newValue);
                    }

                    if (values && values.length > 0 && typeof onFullChange === 'function') {
                        onFullChange(newValue);
                    }
                }
                this.setState({value: newValue});
                break;
            case AttributeTypes.number:
                if (newValue !== value) {
                    if (typeof onChange === 'function') {
                        onChange(newValue);
                    }

                    if (values && values.length > 0 && typeof onFullChange === 'function') {
                        onFullChange(newValue);
                    }
                }
                this.setState({value: newValue});
                break;
            default:
                return null;
        }
    };

    onKeyPress = (event) => {
        let newValue = this.eventToAttrValue(event);

        if (this.props.type !== AttributeTypes.color) {
            if (event.charCode === 13 && typeof this.props.onFullChange === 'function' &&
                newValue !== this.props.value) {
                this.props.onFullChange(newValue);
            }

            this.setState({value: newValue});
        }
    };

    onFocus = () => {
        if (this.props.type === AttributeTypes.color)
            this.setState({picking: true});
    };

    onBlur = (event) => {
        let newValue = this.eventToAttrValue(event);

        if (this.props.type !== AttributeTypes.color) {
            if (typeof this.props.onFullChange === 'function' && !this.options.onlyEnter &&
                newValue !== this.props.value) {
                this.props.onFullChange(newValue);
            }

            this.setState({value: newValue});
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

        return (<FormControl style={this.props.style || {}} fullWidth={this.props.fullWidth} onBlur={this.onBlur} onFocus={this.onFocus}>
            <FormLabel>{this.props.unit ? `${this.props.name} [${this.props.unit}]` : this.props.name}</FormLabel>
            {content}
            <FormHelperText>{this.props.description}</FormHelperText>
        </FormControl>);
    }
}

export default class AttributeEditor extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        selection: PropTypes.array.isRequired,
        fullWidthWidgets: PropTypes.bool
    };

    state = {
        loadedNodes: [],
        territory: {},
        attributes: [],
        modelicaUri: 'Default',
        scale: 0.4
    };

    getSvgAttributeParts = () => {
        const {gmeClient, selection} = this.props,
            {modelicaUri, scale} = this.state,
            {attributes} = SVGCACHE[modelicaUri];
        let node = gmeClient.getNode(selection[0]),
            attributeItems = [];

        if (node === null)
            return null;
        for (let key in attributes) {
            attributeItems.push(<svg
                style={{
                    position: 'absolute',
                    top: attributes[key].bbox.y * scale,
                    left: attributes[key].bbox.x * scale
                }}
                viewBox={'' + (attributes[key].bbox.x * scale) + ' ' + (attributes[key].bbox.y * scale) +
                ' ' + ((attributes[key].bbox.x + attributes[key].bbox.width) * scale) +
                ' ' + ((attributes[key].bbox.y + attributes[key].bbox.height) * scale)}>
                <text
                    x={(attributes[key].parameters.x || 0) * scale}
                    y={(attributes[key].parameters.y || 0) * scale}
                    alignmentBaseline={attributes[key].parameters['alignment-baseline'] || 'middle'}
                    fill={attributes[key].parameters.fill || 'rgb(0,0,255)'}
                    fontFamily={attributes[key].parameters['font-family'] || 'Veranda'}
                    fontSize={Number(attributes[key].parameters['font-size'] || '18') * scale}
                    textAnchor={attributes[key].parameters['text-anchor'] || 'middle'}
                >{attributes[key].text.substring(0, attributes[key].position) +
                node.getAttribute(key) +
                attributes[key].text.substring(attributes[key].position)}</text>
            </svg>)
        }

        return attributeItems;
    };

    onComponentDidMount() {
        const {selection} = this.props;
        let territory = {};

        selection.forEach((item) => {
            territory[item] = {children: 0};
        });

        this.setState({territory: territory});
    }

    handleEvents = (hash, loads, updates, unloads) => {
        //TODO update to handle multiple objects as well
        const {selection, gmeClient} = this.props;
        let {loadedNodes, attributes, modelicaUri} = this.state;

        console.log('handleEvents');

        selection.forEach((nodeId) => {
            if (loads.indexOf(nodeId) !== -1 || updates.indexOf(nodeId) !== -1)
                loadedNodes.push(nodeId);
            if (unloads.indexOf(nodeId) !== -1) {
                loadedNodes.splice(loadedNodes.indexOf(nodeId), 1);
            }
        });

        if (loadedNodes.length > 0) {
            const nodeObj = gmeClient.getNode(loadedNodes[0]),
                attributeNames = nodeObj.getValidAttributeNames(),
                metaNode = gmeClient.getNode(nodeObj.getMetaTypeId());

            modelicaUri = metaNode.getAttribute('ModelicaURI') || 'Default';

            attributes = attributeNames
                .map(id => {
                    const attrMeta = nodeObj.getAttributeMeta(id);
                    return {
                        name: id,
                        value: nodeObj.getAttribute(id),
                        type: attrMeta.type || 'string',
                        enum: attrMeta.enum || null,
                        readonly: attrMeta.readonly,
                        description: attrMeta.description,
                        unit: attrMeta.unit,
                    };
                });

        } else {
            attributes = [];
            modelicaUri = 'Default';
        }

        this.setState({loadedNodes: loadedNodes, attributes: attributes, modelicaUri: modelicaUri});
    };

    somethingChanges = (what, how) => {
        const {selection, gmeClient} = this.props;
        let transaction = selection.length > 1;

        if (transaction) {
            gmeClient.startTransaction('Updating attributes of the selection');
        }

        selection.forEach((nodeId) => {
            gmeClient.setAttribute(nodeId, what, how);
        });

        if (transaction) {
            gmeClient.completeTransaction('Update multiple attributes finished.');
        }
    };

    componentWillReceiveProps(newProps) {
        const {selection} = newProps;
        let territory = {};

        selection.forEach((item) => {
            territory[item] = {children: 0};
        });

        //TODO clearing the loadedNodes should not be necessary, where are the unload events???
        if (selection[0] !== this.props.selection[0]) {
            this.setState({loadedNodes: [], territory: territory, modelicaUri: 'Default'});
        }
    }

    render() {
        const {selection, gmeClient} = this.props,
            {territory, attributes, modelicaUri, scale} = this.state,
            {bbox, base} = SVGCACHE[modelicaUri];
        let attributeItems,
            self = this;

        console.log(modelicaUri);

        attributeItems = attributes
            .filter(attr => {
                return !attr.readonly;
            })
            .map(attribute => {
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
                    style={{marginBottom: attribute.description ? 30 : 0}}
                    key={attribute.name}
                    value={attribute.value}
                    name={attribute.name}
                    fullWidth={this.props.fullWidthWidgets}
                    type={type}
                    values={attribute.enum}
                    description={attribute.description}
                    unit={attribute.unit}
                    options={options}
                    onFullChange={onChangeFn}/>);
            });

        return (
            <Card>
                <Territory activeNode={selection[0]} gmeClient={gmeClient} territory={territory}
                           onUpdate={this.handleEvents} onlyActualEvents={true}/>
                <div style={{textAlign: 'center', width: '100%'}}>
                    <CardHeader title={'Parameters'}/>
                    <a href={`http://doc.modelica.org/om/${modelicaUri}.html`} target='_blank' style={{textDecoration: 'none'}}>
                        <Typography  style={{ fontSize: 10, color: 'rgba(0, 0, 0, 0.54)', /*FIXME: theme.palette.text.secondary*/}}>
                            {modelicaUri.substr('Modelica.'.length)}
                        </Typography>
                        <div style={{
                            height: bbox.height * scale,
                            width: bbox.width * scale,
                            position: 'relative',
                            display: 'inline-flex'
                        }}>

                            {modelicaUri !== 'Default' ? (<Samy svgXML={base}
                                                                style={{
                                                                    height: bbox.height * scale,
                                                                    width: bbox.width * scale
                                                                }}/>) : null}
                            {modelicaUri !== 'Default' ? this.getSvgAttributeParts() : null}
                        </div>
                    </a>
                </div>
                <CardContent>
                    {attributeItems}
                </CardContent>
            </Card>
        );
    }
}