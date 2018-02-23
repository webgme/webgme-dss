import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {DragSource} from 'react-dnd';
import {Samy} from 'react-samy-svg';

import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';
import ModeEdit from 'material-ui-icons/ModeEdit';

import {DRAG_TYPES} from '../../CONSTANTS';
import CanvasItemPort from './CanvasItemPort';
import Territory from '../../gme/BaseComponents/Territory';
import BasicConnection from './BasicConnection';
import SVGCACHE from '../../../svgcache.json';
import {toggleRightDrawer, setActiveSelection} from '../../actions';
import ZLEVELS from '../../gme/utils/zLevels';

const canvasItemSource = {
    beginDrag(props) {
        props.connectionManager.endConnection();

        return {
            gmeId: props.activeNode,
            move: true,
            copy: false,
        };
    },
};

function collect(connector, monitor) {
    return {
        connectDragSource: connector.dragSource(),
        connectDragPreview: connector.dragPreview(),
        isDragging: monitor.isDragging(),
    };
}

const mapStateToProps = state => ({
    scale: state.scale,
    selection: state.activeSelection,
});

const mapDispatchToProps = dispatch => ({
    activateAttributeDrawer: (id) => {
        dispatch(toggleRightDrawer(true));
        dispatch(setActiveSelection([id]));
    },
    selectNode: (id) => {
        dispatch(setActiveSelection([id]));
    },
});

class CanvasItem extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        activeNode: PropTypes.string.isRequired, // This is not the same as the state.activeNode..
        scale: PropTypes.number.isRequired,
        contextNode: PropTypes.string.isRequired,
        connectionManager: PropTypes.object.isRequired,
        eventManager: PropTypes.object.isRequired,
        selectNode: PropTypes.func.isRequired,
        activateAttributeDrawer: PropTypes.func.isRequired,
        selection: PropTypes.arrayOf(PropTypes.string).isRequired,
        connectDragSource: PropTypes.func.isRequired,
        isDragging: PropTypes.func.isRequired,
    };

    // TODO we need to gather the children info (new base class maybe)
    state = {
        position: null,
        showActions: false,
        modelicaUri: 'Default',
        childrenName2Id: {},
        childInfo: {},
        isConnection: null,
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

    onMouseEnter = () => {
        this.setState({showActions: true});
    };

    onMouseLeave = () => {
        this.setState({showActions: false});
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
        const {modelicaUri} = this.state;
        const {attributes} = SVGCACHE[modelicaUri];
        const node = gmeClient.getNode(activeNode);
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

    getActionItems = (force, onlyDelete) => {
        const {activateAttributeDrawer, activeNode} = this.props;
        const {showActions} = this.state;

        if (!showActions && !force) {
            return null;
        }

        const items = [(
            <IconButton
                key="delete"
                style={{
                    height: '20px',
                    width: '20px',
                    position: 'absolute',
                    top: '0px',
                    right: '0px',
                    zIndex: ZLEVELS.action,
                }}
                onClick={this.deleteNode}
            >
                <DeleteIcon style={{
                    height: '20px',
                    width: '20px',
                }}
                />
            </IconButton>),
            (
                <IconButton
                    key="attribute"
                    style={{
                        height: '20px',
                        width: '20px',
                        position: 'absolute',
                        top: '0px',
                        right: '20px',
                        zIndex: ZLEVELS.action,
                    }}
                    onClick={() => {
                        activateAttributeDrawer(activeNode);
                    }}
                >
                    <ModeEdit style={{
                        height: '20px',
                        width: '20px',
                    }}
                    />
                </IconButton>),
        ];

        if (onlyDelete) {
            items.splice(1, 1);
        }

        return items;
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
                showActions: false,
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

    deleteNode = () => {
        const {gmeClient, activeNode} = this.props;

        gmeClient.deleteNode(activeNode);
    };

    isSelected = () => {
        const {selection, activeNode} = this.props;

        return selection.includes(activeNode);
    };

    boxRender = () => {
        const {
            connectDragSource,
            isDragging,
            gmeClient,
            contextNode,
            connectionManager,
            scale,
            eventManager,
            activeNode,
            selectNode,
            activateAttributeDrawer,
        } = this.props;
        const {
            showActions,
            modelicaUri,
            position,
            childrenName2Id,
            childInfo,
            justRemovedIds,
        } = this.state;
        const {ports, bbox, base} = SVGCACHE[modelicaUri];
        const portComponents = [];
        const events = [];
        let i;

        justRemovedIds.forEach((removedId) => {
            events.push({
                id: removedId,
                position: null,
            });
        });

        const keys = Object.keys(ports);
        for (i = 0; i < keys.length; i += 1) {
            if (childrenName2Id[keys[i]]) {
                portComponents.push((<CanvasItemPort
                    key={keys[i]}
                    gmeClient={gmeClient}
                    connectionManager={connectionManager}
                    activeNode={childrenName2Id[keys[i]]}
                    contextNode={contextNode}
                    position={{
                        x: scale * ports[keys[i]].x,
                        y: scale * ports[keys[i]].y,
                    }}
                    dimensions={{
                        x: (scale * ports[keys[i]].width) - 1,
                        y: (scale * ports[keys[i]].height) - 1,
                    }}
                    hidden={!showActions}
                    validTypes={childInfo[childrenName2Id[keys[i]]].validConnection}
                    absolutePosition={{
                        x: (position.x * scale) + (scale * ports[keys[i]].x),
                        y: (position.y * scale) + (scale * ports[keys[i]].y),
                    }}
                />));
                events.push({
                    id: childrenName2Id[keys[i]],
                    position: {
                        x: (position.x * scale) + (scale * (ports[keys[i]].x + (ports[keys[i]].width / 2))),
                        y: (position.y * scale) + (scale * (ports[keys[i]].y + (ports[keys[i]].height / 2))),
                    },
                });
            }
        }

        events.forEach((event) => {
            eventManager.fire(event.id, {position: event.position});
        });

        const content = (
            <div
                style={{
                    opacity: isDragging ? 0.3 : 0.99,
                    position: 'absolute',
                    top: position.y * scale,
                    left: position.x * scale,
                    height: bbox.height * scale,
                    width: bbox.width * scale,
                    border: showActions || this.isSelected() ? '1px dashed #000000' : '1px solid transparent',
                    zIndex: 10,
                }}
                role="presentation"
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    selectNode(activeNode);
                }}
                onDoubleClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    activateAttributeDrawer(activeNode);
                }}
                onKeyPress={() => {
                }}
            >
                {portComponents}
                <Samy
                    svgXML={base}
                    style={{
                        height: bbox.height * scale,
                        width: bbox.width * scale,
                    }}
                />
                {this.getAttributeItems()}
                {this.getActionItems()}
            </div>);

        return connectDragSource(content);
    };

    connectionRender = () => {
        const {endPoints, showActions} = this.state;
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
                    style={{
                        position: 'absolute',
                        top: midpoint.y - 20,
                        left: midpoint.x - 20,
                        height: 40,
                        width: 40,
                        zIndex: ZLEVELS.connectionItem,
                    }}
                    onMouseEnter={this.onMouseEnter}
                    onMouseLeave={this.onMouseLeave}
                >{this.getActionItems(false, true)}
                </div>),
                (<BasicConnection
                    key={activeNode}
                    path={points}
                    dashed={showActions}
                    hasWrapper={false}
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

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(DragSource(DRAG_TYPES.GME_NODE, canvasItemSource, collect)(CanvasItem));
