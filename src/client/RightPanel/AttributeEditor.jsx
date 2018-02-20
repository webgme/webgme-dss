import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Card, {CardHeader, CardContent} from 'material-ui/Card';

import Territory from '../gme/BaseComponents/Territory';
import AttributeItem from './AttributeItem';

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

        children: PropTypes.object,

        fullWidthWidgets: PropTypes.bool,
        hideReadOnly: PropTypes.bool,
    };

    static defaultProps = {
        fullWidthWidgets: false,
        hideReadOnly: false,
        children: null,
    }

    state = {
        loadedNodes: [],
        territory: {},
        attributes: [],
    };


    componentWillReceiveProps(newProps) {
        const {selection} = newProps;
        const territory = {};

        selection.forEach((item) => {
            territory[item] = {children: 0};
        });

        // TODO clearing the loadedNodes should not be necessary, where are the unload events???
        if (selection[0] !== this.props.selection[0]) {
            this.setState({loadedNodes: [], territory});
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

    handleEvents = (hash, loads, updates, unloads) => {
        // TODO update to handle multiple objects as well
        const {selection, gmeClient} = this.props;
        let {attributes} = this.state;
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
        }

        this.setState({loadedNodes, attributes});
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
        const {selection, gmeClient, hideReadOnly} = this.props;
        const {
            territory, attributes, loadedNodes,
        } = this.state;

        const attributeItems = attributes
            .filter(attr => !hideReadOnly || !attr.readonly)
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
                        readonly={attribute.readonly}
                        onFullChange={onChangeFn}
                    />);
            });

        const icon = (loadedNodes.length > 0 && this.props.children) ?
            React.Children.map(this.props.children, (child) => {
                const nodeId = selection[0]; // This assumes only one node.
                return React.cloneElement(child, {nodeId});
            })
            : null;

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
                    {icon}
                </div>
                <CardContent>
                    {attributeItems}
                </CardContent>
            </Card>
        );
    }
}
