import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Card, {CardHeader, CardContent} from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import {Samy} from 'react-samy-svg';

import Territory from '../gme/BaseComponents/Territory';
import AttributeItem from './AttributeItem';
import SVGCACHE from '../../svgcache.json';

export const AttributeTypes = {
    string: 'string',
    number: 'number',
    color: 'color',
    boolean: 'boolean',
    asset: 'asset',
};

export default class AttributeEditor extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        selection: PropTypes.arrayOf(PropTypes.string).isRequired,
        fullWidthWidgets: PropTypes.bool,
        options: PropTypes.object,
    };

    static defaultProps = {
        fullWidthWidgets: false,
        options: {},
    }

    state = {
        loadedNodes: [],
        territory: {},
        attributes: [],
        modelicaUri: 'Default',
        scale: 0.4,
    };


    componentWillReceiveProps(newProps) {
        const {selection} = newProps;
        const territory = {};

        selection.forEach((item) => {
            territory[item] = {children: 0};
        });

        // TODO clearing the loadedNodes should not be necessary, where are the unload events???
        if (selection[0] !== this.props.selection[0]) {
            this.setState({loadedNodes: [], territory, modelicaUri: 'Default'});
        }
    }

    onComponentDidMount() {
        const {selection} = this.props;
        const territory = {};

        selection.forEach((item) => {
            territory[item] = {children: 0};
        });

        this.setState({territory});
    }

    getSvgAttributeParts = () => {
        const {gmeClient, selection} = this.props;
        const {modelicaUri, scale} = this.state;
        const svgAttrs = SVGCACHE[modelicaUri].attributes;

        const node = gmeClient.getNode(selection[0]);

        if (node === null) {
            return null;
        }

        return Object.keys(svgAttrs).map(attrDesc => (
            <svg
                style={{
                    position: 'absolute',
                    top: attrDesc.bbox.y * scale,
                    left: attrDesc.bbox.x * scale,
                }}
                viewBox={`${attrDesc.bbox.x * scale} ${attrDesc.bbox.y * scale}
                ${(attrDesc.bbox.x + attrDesc.bbox.width) * scale}
                ${(attrDesc.bbox.y + attrDesc.bbox.height) * scale}`}
            >
                <text
                    x={(attrDesc.parameters.x || 0) * scale}
                    y={(attrDesc.parameters.y || 0) * scale}
                    alignmentBaseline={attrDesc.parameters['alignment-baseline'] || 'middle'}
                    fill={attrDesc.parameters.fill || 'rgb(0,0,255)'}
                    fontFamily={attrDesc.parameters['font-family'] || 'Veranda'}
                    fontSize={Number(attrDesc.parameters['font-size'] || '18') * scale}
                    textAnchor={attrDesc.parameters['text-anchor'] || 'middle'}
                >{attrDesc.text.substring(0, attrDesc.position) +
                node.getAttribute(attrDesc.name) +
                attrDesc.text.substring(attrDesc.position)}
                </text>
            </svg>));
    };

    handleEvents = (hash, loads, updates, unloads) => {
        // TODO update to handle multiple objects as well
        const {selection, gmeClient} = this.props;
        let {attributes, modelicaUri} = this.state;
        const {loadedNodes} = this.state;

        // console.log('handleEvents');

        selection.forEach((nodeId) => {
            if (loads.indexOf(nodeId) !== -1 || updates.indexOf(nodeId) !== -1) {
                loadedNodes.push(nodeId);
            }
            if (unloads.indexOf(nodeId) !== -1) {
                loadedNodes.splice(loadedNodes.indexOf(nodeId), 1);
            }
        });

        if (loadedNodes.length > 0) {
            const nodeObj = gmeClient.getNode(loadedNodes[0]);
            const attributeNames = nodeObj.getValidAttributeNames();
            const metaNode = gmeClient.getNode(nodeObj.getMetaTypeId());

            modelicaUri = metaNode.getAttribute('ModelicaURI') || 'Default';

            attributes = attributeNames
                .map((id) => {
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

        this.setState({loadedNodes, attributes, modelicaUri});
    };

    somethingChanges = (what, how) => {
        const {selection, gmeClient} = this.props;
        const transaction = selection.length > 1;

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

    render() {
        const {selection, gmeClient, options} = this.props;
        const {
            territory, attributes, modelicaUri, scale,
        } = this.state;

        const {bbox, base} = SVGCACHE[modelicaUri];

        const attributeItems = attributes
            .filter(attr => !attr.readonly)
            .map((attribute) => {
                const onChangeFn = (newValue) => {
                    this.somethingChanges(attribute.name, newValue);
                };

                let {type} = attribute;

                switch (attribute.type) {
                    case 'string':
                    case 'boolean':
                    case 'asset':
                        break;
                    case 'integer':
                    case 'float':
                        type = AttributeTypes.number;
                        break;
                    default:
                        type = AttributeTypes.string;
                }

                return (
                    <AttributeItem
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
                        onFullChange={onChangeFn}
                    />);
            });

        return (
            <Card>
                <Territory
                    activeNode={selection[0]}
                    gmeClient={gmeClient}
                    territory={territory}
                    onUpdate={this.handleEvents}
                    onlyActualEvents
                />
                <div style={{textAlign: 'center', width: '100%'}}>
                    <CardHeader title="Parameters"/>
                    <a
                        href={`http://doc.modelica.org/om/${modelicaUri}.html`}
                        target="_blank"
                        style={{textDecoration: 'none'}}
                    >
                        <Typography style={{fontSize: 10, color: 'rgba(0, 0, 0, 0.54)'}}>
                            {modelicaUri.substr('Modelica.'.length)}
                        </Typography>
                        <div style={{
                            height: bbox.height * scale,
                            width: bbox.width * scale,
                            position: 'relative',
                            display: 'inline-flex',
                        }}
                        >

                            {modelicaUri !== 'Default' ? (<Samy
                                svgXML={base}
                                style={{
                                    height: bbox.height * scale,
                                    width: bbox.width * scale,
                                }}
                            />) : null}
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
