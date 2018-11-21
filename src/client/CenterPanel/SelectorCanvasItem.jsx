import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {Samy} from 'react-samy-svg';

import BasicConnection from 'webgme-react-components/src/components/BasicConnection';
import getSVGData from 'webgme-react-components/src/utils/getSVGData';

import Territory from 'webgme-react-components/src/components/Territory';

import ZLEVELS from '../gme/utils/zLevels';
import colorHash from '../gme/utils/colorHash';

const mapStateToProps = state => ({
    scale: state.scale,
    variables: state.plotData.variables,
});

const mapDispatchToProps = (/* dispatch */) => ({});

class SelectorCanvasItem extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        activeNode: PropTypes.string.isRequired, // This is not the same as the state.activeNode..
        scale: PropTypes.number.isRequired,
        eventManager: PropTypes.object.isRequired,
        variables: PropTypes.arrayOf(PropTypes.string).isRequired,
    };

    // TODO we need to gather the children info (new base class maybe)
    state = {
        position: null,
        modelicaUri: 'Default',
        childrenName2Id: {},
        childInfo: {},
        isConnection: null,
        color: 'black',
        endPoints: {
            src: {id: null},
            dst: {id: null},
        },
        territory: (() => {
            const {activeNode} = this.props;
            return {[activeNode]: {children: 0}};
        })(),
        justRemovedIds: [],
    };

    getChildInfo = (childNode) => {
        const {gmeClient} = this.props;
        const metaNodes = gmeClient.getAllMetaNodes(true);
        const info = {
            name: childNode.getAttribute('name'),
            validConnection: {},
        };
        const paths = Object.keys(metaNodes);

        paths.forEach((path) => {
            if (childNode.isValidTargetOf(path, 'src')) {
                info.validConnection.src = path;
            }
            if (childNode.isValidTargetOf(path, 'dst')) {
                info.validConnection.dst = path;
            }
        });

        return info;
    };

    getAttributeItems = () => {
        const {gmeClient, activeNode, scale} = this.props;
        const node = gmeClient.getNode(activeNode);
        const {attributes} = getSVGData(node);
        const attributeItems = [];
        const names = Object.keys(attributes);

        if (node === null) {
            return null;
        }
        names.forEach((key) => {
            attributeItems.push((
                <svg
                    key={key}
                    style={{
                        position: 'absolute',
                        top: /* position.y + */attributes[key].bbox.y * scale,
                        left: /* position.x + */attributes[key].bbox.x * scale,
                    }}
                    viewBox={`${attributes[key].bbox.x * scale} ${attributes[key].bbox.y * scale}
                    ${attributes[key].bbox.width * scale}
                    ${attributes[key].bbox.height * scale}`}
                >
                    <text
                        x={(attributes[key].parameters.x || 0) * scale}
                        y={(attributes[key].parameters.y || 0) * scale}
                        alignmentBaseline={attributes[key].parameters['alignment-baseline'] || 'middle'}
                        fill={attributes[key].parameters.fill || 'rgb(0,0,255)'}
                        fontFamily={attributes[key].parameters['font-family'] || 'Veranda'}
                        fontSize={Number(attributes[key].parameters['font-size'] || '18') * scale}
                        textAnchor={attributes[key].parameters['text-anchor'] || 'middle'}
                    >
                        {attributes[key].text.substring(0, attributes[key].position) +
                        node.getAttribute(key) +
                        attributes[key].text.substring(attributes[key].position)}
                    </text>
                </svg>));
        });

        return attributeItems;
    };

    getSelectionItems = (nodeId, opacity) => {
        const {gmeClient, variables, activeNode} = this.props;
        const node = gmeClient.getNode(nodeId);
        const hostNode = gmeClient.getNode(activeNode);

        if (!(node && hostNode)) {
            return [];
        }

        let variablePrefix;

        if (nodeId === activeNode) {
            variablePrefix = hostNode.getAttribute('name');
        } else {
            variablePrefix = `${hostNode.getAttribute('name')}.${node.getAttribute('name')}`;
        }

        const matches = variables.filter(variable =>
            variable.substring(Math.max(0, variable.indexOf('(') + 1), variable.lastIndexOf('.')) === variablePrefix);

        return matches.map((variable, index) => {
            const step = 100 / matches.length;

            return (
                <div style={{
                    top: `${index * step}%`,
                    width: '100%',
                    height: `${step}%`,
                    opacity: opacity || 0.5,
                    position: 'absolute',
                    backgroundColor: colorHash(variable).rgb,
                }}
                />
            );
        });
    };

    territoryUpdates = (hash, loads, updates, unloads) => {
        const {activeNode, gmeClient, eventManager} = this.props;
        const {endPoints} = this.state;

        // console.log('event-', hash, loads, updates, unloads);
        if (unloads.indexOf(activeNode) !== -1) {
            // main object have been unloaded so remove everything...
            if (endPoints.src.event) {
                eventManager.unsubscribe(endPoints.src.id, endPoints.src.event);
            }
            if (endPoints.dst.event) {
                eventManager.unsubscribe(endPoints.dst.id, endPoints.dst.event);
            }

            this.setState({
                position: null,
                modelicaUri: 'Default',
                childrenName2Id: {},
                childInfo: {},
                isConnection: null,
                endPoints: {
                    src: {id: null},
                    dst: {id: null},
                },
                territory: null,
                justRemovedIds: [],
            });
            return;
        }

        const nodeObj = gmeClient.getNode(activeNode);
        const metaNode = gmeClient.getNode(nodeObj.getMetaTypeId());
        const validPointers = nodeObj.getValidPointerNames();
        const isConnection = validPointers.indexOf('src') !== -1 && validPointers.indexOf('dst') !== -1;
        let newEndpoints = null;
        let modelicaUri = 'Default';
        let color = 'black';
        const territory = {};
        let newChildrenName2Id = {};
        const childrenPaths = nodeObj.getChildrenIds();
        let newChildInfo = {};

        if (isConnection) {
            newEndpoints = {
                src: {
                    id: nodeObj.getPointerId('src'),
                    position: null,
                    event: this.srcEvent,
                },
                dst: {
                    id: nodeObj.getPointerId('dst'),
                    position: null,
                    event: this.dstEvent,
                },
            };

            color = nodeObj.getRegistry('color');

            if (endPoints.src.id !== newEndpoints.src.id || endPoints.dst.id !== newEndpoints.dst.id) {
                // subscription to events
                let event;

                event = eventManager.subscribe(newEndpoints.src.id, newEndpoints.src.event);
                if (event) {
                    newEndpoints.src.position = event.position;
                }
                event = eventManager.subscribe(newEndpoints.dst.id, newEndpoints.dst.event);
                if (event) {
                    newEndpoints.dst.position = event.position;
                }
            } else {
                newEndpoints = endPoints;
            }
            territory[activeNode] = {children: 0};
        } else {
            newEndpoints = endPoints;
            newChildrenName2Id = this.state.childrenName2Id;
            newChildInfo = this.state.childInfo;
            modelicaUri = metaNode.getAttribute('ModelicaURI') || 'Default';
            childrenPaths.forEach((childPath) => {
                if (loads.indexOf(childPath) !== -1 || updates.indexOf(childPath) !== -1) {
                    const childNode = gmeClient.getNode(childPath);
                    newChildrenName2Id[childNode.getAttribute('name')] = childPath;
                    newChildInfo[childPath] = this.getChildInfo(childNode);
                } else if (unloads.indexOf(childPath) !== -1) {
                    const names = Object.keys(newChildrenName2Id);
                    names.forEach((name) => {
                        if (newChildrenName2Id[name] === childPath) {
                            delete newChildrenName2Id[name];
                            delete newChildInfo[childPath];
                        }
                    });
                }
            });
            territory[activeNode] = {children: 1};
        }

        this.setState({
            position: nodeObj.getRegistry('position'),
            modelicaUri,
            isConnection,
            color,
            endPoints: newEndpoints,
            childrenName2Id: newChildrenName2Id,
            childInfo: newChildInfo,
            territory,
            justRemovedIds: unloads,
        });
    };

    srcEvent = (id, event) => {
        const {position} = this.state.endPoints.src;

        if (id !== this.state.endPoints.src.id) {
            return;
        }
        if (event.position === null || position === null ||
            event.position.x !== position.x || event.position.y !== position.y) {
            const {endPoints} = this.state;
            endPoints.src.position = event.position;
            this.setState({endPoints});
        }
    };

    dstEvent = (id, event) => {
        const {position} = this.state.endPoints.dst;
        if (id !== this.state.endPoints.dst.id) {
            return;
        }
        if (event.position === null || position === null ||
            event.position.x !== position.x || event.position.y !== position.y) {
            const {endPoints} = this.state;
            endPoints.dst.position = event.position;
            this.setState({endPoints});
        }
    };

    boxRender = () => {
        const {
            scale,
            eventManager,
            activeNode,
            gmeClient,
        } = this.props;
        const {
            position,
            childrenName2Id,
            justRemovedIds,
        } = this.state;
        const {ports, bbox, base} = getSVGData(gmeClient.getNode(activeNode));
        const events = [];
        const portComponents = [];

        justRemovedIds.forEach((removedId) => {
            events.push({
                id: removedId,
                position: null,
            });
        });

        Object.keys(ports).forEach((name) => {
            const id = childrenName2Id[name];
            const port = ports[name];
            if (id) {
                portComponents.push((
                    <div
                        key={id}
                        role="presentation"
                        style={{
                            position: 'absolute',
                            left: (scale * port.x) - 2,
                            top: (scale * port.y) - 2,
                            width: (scale * port.width) + 4,
                            height: (scale * port.height) + 4,
                        }}
                    >
                        {this.getSelectionItems(id, 1)}
                    </div>
                ));
                events.push({
                    id: childrenName2Id[name],
                    position: {
                        x: (position.x * scale) + (scale * (ports[name].x + (ports[name].width / 2))),
                        y: (position.y * scale) + (scale * (ports[name].y + (ports[name].height / 2))),
                    },
                });
            }
        });

        events.forEach((event) => {
            eventManager.fire(event.id, {position: event.position});
        });

        const content = (
            <div
                style={{
                    opacity: 0.99,
                    position: 'absolute',
                    top: position.y * scale,
                    left: position.x * scale,
                    height: bbox.height * scale,
                    width: bbox.width * scale,
                    zIndex: ZLEVELS.item,
                }}
                role="presentation"
            >
                {this.getSelectionItems(activeNode)}
                {portComponents}
                <Samy
                    svgXML={base}
                    style={{
                        height: bbox.height * scale,
                        width: bbox.width * scale,
                    }}
                />
                {this.getAttributeItems()}
            </div>);

        return content;
    };

    connectionRender = () => {
        const {endPoints, color} = this.state;
        const {activeNode} = this.props;
        let points;
        let midpoint;

        if (endPoints.src.position && endPoints.dst.position) {
            midpoint = {
                x: endPoints.src.position.x,
                y: endPoints.dst.position.y,
            };

            points = [endPoints.src.position, JSON.parse(JSON.stringify(midpoint)), endPoints.dst.position];

            // check if one section of the connection is too short
            if (Math.abs(endPoints.src.position.x - endPoints.dst.position.x) < 40 &&
                Math.abs(endPoints.src.position.y - endPoints.dst.position.y) > 40) {
                midpoint.y = (endPoints.src.position.y + endPoints.dst.position.y) * 0.5;
                midpoint.x = endPoints.dst.position.x;
            } else if (Math.abs(endPoints.src.position.x - endPoints.dst.position.x) > 40 &&
                Math.abs(endPoints.src.position.y - endPoints.dst.position.y) < 40) {
                midpoint.x = (endPoints.src.position.x + endPoints.dst.position.x) * 0.5;
                midpoint.y = endPoints.src.position.y;
            }

            return [(
                <div
                    key={`${activeNode}-handler`}
                    style={{
                        position: 'absolute',
                        top: midpoint.y - 20,
                        left: midpoint.x - 20,
                        height: 40,
                        width: 40,
                        zIndex: ZLEVELS.connectionItem,
                    }}
                />),
                (<BasicConnection
                    key={activeNode}
                    path={points}
                    dashed={false}
                    hasWrapper={false}
                    color={color}
                />)];
        }

        return null;
    };

    render() {
        const {activeNode, gmeClient} = this.props;
        const {territory, isConnection} = this.state;
        let content;

        switch (isConnection) {
            case true:
                content = this.connectionRender();
                break;
            case false:
                content = this.boxRender();
                break;
            default:
                content = null;
        }

        return (
            <div>
                <Territory
                    key={`${activeNode}_territory`}
                    activeNode={activeNode}
                    gmeClient={gmeClient}
                    territory={territory}
                    onlyActualEvents
                    onUpdate={this.territoryUpdates}
                />
                {content}
            </div>);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectorCanvasItem);
