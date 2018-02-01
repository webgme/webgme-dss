import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {DragSource} from 'react-dnd';
import {Samy} from 'react-samy-svg';

import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';
import ModeEdit from 'material-ui-icons/ModeEdit';

import {DRAG_TYPES} from '../CONSTANTS';
import CanvasItemPort from './CanvasItemPort';
import Territory from '../gme/BaseComponents/Territory';
import BasicConnection from './BasicConnection';
import SVGCACHE from './../../svgcache';
import {toggleRightDrawer, setActiveSelection} from '../actions';

const canvasItemSource = {
    beginDrag(props) {
        props.connectionManager.endConnection();

        return {
            gmeId: props.activeNode,
            move: true,
            copy: false
        };
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging()
    }
}

const mapStateToProps = state => {
    return {
        scale: state.scale
    }
};

const mapDispatchToProps = dispatch => {
    return {
        activateAttributeDrawer: id => {
            dispatch(toggleRightDrawer(true));
            dispatch(setActiveSelection([id]));
        }
    }
};

class CanvasItem extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        activeNode: PropTypes.string.isRequired, // This is not the same as the state.activeNode..
        scale: PropTypes.number.isRequired,
        connectDragSource: PropTypes.func.isRequired,
        connectDragPreview: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired,
        contextNode: PropTypes.string.isRequired,
        connectionManager: PropTypes.object.isRequired,
        eventManager: PropTypes.object.isRequired,

        activateAttributeDrawer: PropTypes.func.isRequired
    };

    //TODO we need to gather the children info (new base class maybe)
    state = {
        position: null,
        name: null,
        showActions: false,
        modelicaUri: 'Default',
        svgReady: false,
        childrenName2Id: {},
        childInfo: {},
        isConnection: null,
        currentRootHash: null,
        endPoints: {src: {id: null}, dst: {id: null}},
        territory: null,
        justRemovedIds: []
    };

    constructor(/*props*/) {
        super();
        console.count('CanvasItem:ctor');
    }

    onMouseEnter = () => {
        this.setState({showActions: true});
    };

    onMouseLeave = () => {
        this.setState({showActions: false});
    };

    componentDidMount() {
        let territory = {};
        territory[this.props.activeNode] = {children: 0};

        this.setState({territory: territory});
    }

    deleteNode = () => {
        this.props.gmeClient.deleteNode(this.props.activeNode);
    };

    srcEvent = (id, event) => {
        const {position} = this.state.endPoints.src;

        if (id !== this.state.endPoints.src.id)
            return;
        if (event.position === null || position === null ||
            event.position.x !== position.x || event.position.y !== position.y) {
            let endPoints = this.state.endPoints;
            endPoints.src.position = event.position;
            this.setState({endPoints: endPoints});
        }
    };

    dstEvent = (id, event) => {
        const {position} = this.state.endPoints.dst;
        if (id !== this.state.endPoints.dst.id)
            return;
        if (event.position === null || position === null ||
            event.position.x !== position.x || event.position.y !== position.y) {
            let endPoints = this.state.endPoints;
            endPoints.dst.position = event.position;
            this.setState({endPoints: endPoints});
        }
    };

    getChildInfo = (childNode) => {
        const {gmeClient} = this.props,
            metaNodes = gmeClient.getAllMetaNodes(true);
        let info = {name: childNode.getAttribute('name'), validConnection: {}};
        for (let path in metaNodes) {
            if (childNode.isValidTargetOf(path, 'src'))
                info.validConnection.src = path;
            if (childNode.isValidTargetOf(path, 'dst'))
                info.validConnection.dst = path;
        }

        return info;
    };

    territoryUpdates = (hash, loads, updates, unloads) => {
        const {activeNode, gmeClient, eventManager} = this.props,
            {endPoints} = this.state;

        // console.log('event-', hash, loads, updates, unloads);
        if (unloads.indexOf(activeNode) !== -1) {
            //main object have been unloaded so remove everything...
            let endPoints = this.state.endPoints;

            if (endPoints.src.event) {
                eventManager.unsubscribe(endPoints.src.id, endPoints.src.event);
            }
            if (endPoints.dst.event) {
                eventManager.unsubscribe(endPoints.dst.id, endPoints.dst.event);
            }

            this.setState({
                position: null,
                name: null,
                showActions: false,
                modelicaUri: 'Default',
                svgReady: false,
                childrenName2Id: {},
                childInfo: {},
                isConnection: null,
                currentRootHash: null,
                endPoints: {src: {id: null}, dst: {id: null}},
                territory: null,
                justRemovedIds: []
            });
            return;
        }

        let nodeObj = gmeClient.getNode(activeNode),
            metaNode = gmeClient.getNode(nodeObj.getMetaTypeId()),
            validPointers = nodeObj.getValidPointerNames(),
            isConnection = validPointers.indexOf('src') !== -1 && validPointers.indexOf('dst') !== -1,
            newEndpoints = null,
            modelicaUri = 'Default',
            territory = {},
            childrenPaths = nodeObj.getChildrenIds(),
            childrenName2Id = {},
            childInfo = {};

        if (isConnection) {
            newEndpoints = {
                src: {id: nodeObj.getPointerId('src'), position: null, event: this.srcEvent},
                dst: {id: nodeObj.getPointerId('dst'), position: null, event: this.dstEvent}
            };

            if (endPoints.src.id !== newEndpoints.src.id || endPoints.dst.id !== newEndpoints.dst.id) {
                //subscription to events
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
            childrenName2Id = this.state.childrenName2Id;
            childInfo = this.state.childInfo;
            modelicaUri = metaNode.getAttribute('ModelicaURI') || 'Default';
            childrenPaths.forEach((childPath) => {
                if (loads.indexOf(childPath) !== -1 || updates.indexOf(childPath) !== -1) {
                    let childNode = gmeClient.getNode(childPath);
                    childrenName2Id[childNode.getAttribute('name')] = childPath;
                    childInfo[childPath] = this.getChildInfo(childNode);
                } else if (unloads.indexOf(childPath) !== -1) {
                    let name;
                    for (name in childrenName2Id) {
                        if (childrenName2Id[name] === childPath) {
                            delete childrenName2Id[name];
                            delete childInfo[childPath];
                        }
                    }
                }
            });
            territory[activeNode] = {children: 1};
        }

        this.setState({
            position: nodeObj.getRegistry('position'),
            name: nodeObj.getAttribute('name'),
            modelicaUri: modelicaUri,
            isConnection: isConnection,
            endPoints: newEndpoints,
            childrenName2Id: childrenName2Id,
            childInfo: childInfo,
            territory: territory,
            justRemovedIds: unloads
        });
    };

    getAttributeItems = () => {
        const {gmeClient, activeNode, scale} = this.props,
            {modelicaUri} = this.state,
            {attributes} = SVGCACHE[modelicaUri];
        let node = gmeClient.getNode(activeNode),
            attributeItems = [];

        if (node === null)
            return null;
        for (let key in attributes) {
            // "alignment-baseline": "middle",
            //     "fill": "rgb(0,0,255)",
            //     "font-family": "Verdana",
            //     "font-size": "18",
            //     "text-anchor": "middle",
            //     "x": "155.0",
            //     "y": "40.0"
            attributeItems.push(<svg
                style={{
                    position: 'absolute',
                    top: /*position.y + */attributes[key].bbox.y * scale,
                    left: /*position.x + */attributes[key].bbox.x * scale
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

    getActionItems = (force, onlyDelete) => {
        const {activateAttributeDrawer, activeNode} = this.props,
            {showActions} = this.state;
        let items;

        if (!showActions && !force)
            return null;

        items = [
            (<IconButton style={{height: '20px', width: '20px', position: 'absolute', top: '0px', right: '0px'}}
                         onClick={this.deleteNode}>
                <DeleteIcon style={{height: '20px', width: '20px'}}/>
            </IconButton>),
            (<IconButton style={{
                height: '20px',
                width: '20px',
                position: 'absolute',
                top: '0px',
                right: '20px',
                zIndex: 11
            }}
                         onClick={() => {
                             activateAttributeDrawer(activeNode);
                         }}>
                <ModeEdit style={{height: '20px', width: '20px', zIndex: 11}}/>
            </IconButton>)
        ];

        if (onlyDelete)
            items.splice(1, 1);

        return items;
    };

    boxRender = () => {
        const {
                connectDragSource,
                isDragging,
                gmeClient,
                contextNode,
                connectionManager,
                scale,
                eventManager
            } = this.props,
            {
                showActions,
                modelicaUri,
                position,
                childrenName2Id,
                childInfo,
                justRemovedIds
            } = this.state,
            {ports, bbox, base} = SVGCACHE[modelicaUri];
        let portComponents = [],
            i, keys,
            events = [];

        justRemovedIds.forEach((removedId) => {
            events.push({id: removedId, position: null});
        });

        keys = Object.keys(ports);
        for (i = 0; i < keys.length; i += 1) {
            if (childrenName2Id[keys[i]]) {
                portComponents.push((<CanvasItemPort
                    key={keys[i]}
                    gmeClient={gmeClient}
                    connectionManager={connectionManager}
                    activeNode={childrenName2Id[keys[i]]}
                    contextNode={contextNode}
                    position={{x: scale * ports[keys[i]].x, y: scale * ports[keys[i]].y}}
                    dimensions={{x: scale * ports[keys[i]].width - 1, y: scale * ports[keys[i]].height - 1}}
                    hidden={!showActions}
                    validTypes={childInfo[childrenName2Id[keys[i]]].validConnection}
                    absolutePosition={{
                        x: position.x + (scale * ports[keys[i]].x),
                        y: position.y + (scale * ports[keys[i]].y)
                    }}/>));
                events.push({
                    id: childrenName2Id[keys[i]],
                    position: {
                        x: position.x + (scale * (ports[keys[i]].x + (ports[keys[i]].width / 2))),
                        y: position.y + (scale * (ports[keys[i]].y + (ports[keys[i]].height / 2)))
                    }
                });
            }
        }

        events.forEach((event) => {
            eventManager.fire(event.id, {position: event.position});
        });

        return connectDragSource(
            <div style={{
                opacity: isDragging ? 0.3 : 0.99,
                position: 'absolute',
                top: position.y,
                left: position.x,
                height: bbox.height * scale,
                width: bbox.width * scale,
                border: showActions ? "1px dashed #000000" : "1px solid transparent",
                zIndex: 10
            }}
                 onMouseEnter={this.onMouseEnter}
                 onMouseLeave={this.onMouseLeave}>
                {portComponents}
                <Samy svgXML={base}
                      style={{
                          height: bbox.height * scale,
                          width: bbox.width * scale
                      }}/>
                {this.getAttributeItems()}
                {this.getActionItems()}
            </div>);
    };

    connectionRender = () => {
        const {endPoints, showActions} = this.state,
            {activeNode} = this.props;
        let points;

        if (endPoints.src.position && endPoints.dst.position) {
            points = [endPoints.src.position, {
                x: endPoints.src.position.x,
                y: endPoints.dst.position.y
            }, endPoints.dst.position];

            return [(<div style={{
                position: 'absolute',
                top: endPoints.dst.position.y - 20,
                left: endPoints.src.position.x - 20,
                height: 40,
                width: 40,
                zIndex: 11
            }}
                          onMouseEnter={this.onMouseEnter}
                          onMouseLeave={this.onMouseLeave}>{this.getActionItems(false, true)}</div>),
                (<BasicConnection
                    key={activeNode}
                    path={points}
                    dashed={showActions}
                    hasWrapper={false}/>)];
        }

        return null;
    };

    render() {
        const {activeNode, gmeClient} = this.props,
            {territory, isConnection} = this.state;
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

        return (<div>
            <Territory
                key={activeNode + '_territory'}
                activeNode={activeNode}
                gmeClient={gmeClient}
                territory={territory}
                onlyActualEvents={true}
                onUpdate={this.territoryUpdates}/>
            {content}
        </div>);
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(
    DragSource(DRAG_TYPES.GME_NODE, canvasItemSource, collect)(CanvasItem)
);