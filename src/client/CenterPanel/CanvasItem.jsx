import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Samy} from 'react-samy-svg';
import {DragSource} from 'react-dnd';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';
import ModeEdit from 'material-ui-icons/ModeEdit';
import ejs from 'ejs';

import {DRAG_TYPES} from '../CONSTANTS';
import CanvasItemPort from './CanvasItemPort';
import Territory from '../gme/BaseComponents/Territory';
import BasicConnection from './BasicConnection';
import SVGCACHE from './../../svgcache';

const canvasItemSource = {
    beginDrag(props) {
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

class CanvasItem extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        activeNode: PropTypes.string.isRequired,
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
        isConnection: null,
        currentRootHash: null,
        endPoints: {src: {id: null}, dst: {id: null}},
        territory: null,
        justRemovedIds: [],
        svgXml: ''
    };

    constructor(props) {
        super(props);
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
                isConnection: null,
                currentRootHash: null,
                endPoints: {src: {id: null}, dst: {id: null}},
                territory: null,
                justRemovedIds: [],
                svgXml: ''
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
            svgXml = '';

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
            modelicaUri = metaNode.getAttribute('ModelicaURI') || 'Default';
            childrenPaths.forEach((childPath) => {
                if (loads.indexOf(childPath) !== -1 || updates.indexOf(childPath) !== -1) {
                    let childNode = gmeClient.getNode(childPath);
                    childrenName2Id[childNode.getAttribute('name')] = childPath;
                } else if (unloads.indexOf(childPath) !== -1) {
                    let name;
                    for (name in childrenName2Id) {
                        if (childrenName2Id[name] === childPath) {
                            delete childrenName2Id[name];
                        }
                    }
                }
            });
            territory[activeNode] = {children: 1};
            svgXml = ejs.render(SVGCACHE[modelicaUri].template, nodeObj);
        }

        // console.log(activeNode, ':', this.state.position, '->', nodeObj.getRegistry('position'));
        this.setState({
            position: nodeObj.getRegistry('position'),
            name: nodeObj.getAttribute('name'),
            modelicaUri: modelicaUri,
            isConnection: isConnection,
            endPoints: newEndpoints,
            childrenName2Id: childrenName2Id,
            territory: territory,
            justRemovedIds: unloads,
            svgXml: svgXml
        });
    };

    boxRender = () => {
        const {
                connectDragSource,
                isDragging,
                gmeClient,
                contextNode,
                connectionManager,
                scale,
                activeNode,
                eventManager,
                activateAttributeDrawer
            } = this.props,
            {
                showActions,
                modelicaUri,
                position,
                childrenName2Id,
                justRemovedIds,
                svgXml
            } = this.state,
            ports = SVGCACHE[modelicaUri].ports,
            baseDimensions = {x: 320, y: 210};
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
                    activeNode={activeNode}
                    contextNode={contextNode}
                    position={{x: scale * ports[keys[i]].x, y: scale * ports[keys[i]].y}}
                    dimensions={{x: scale * ports[keys[i]].width, y: scale * ports[keys[i]].height}}
                    hidden={!showActions}
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
                height: baseDimensions.y * scale,
                width: baseDimensions.x * scale,
                border: showActions ? "1px dashed #000000" : "1px solid transparent",
                zIndex: 10
            }}
                 onMouseEnter={this.onMouseEnter}
                 onMouseLeave={this.onMouseLeave}>
                {portComponents}
                <Samy svgXML={svgXml}
                      style={{
                          height: baseDimensions.y * scale,
                          width: baseDimensions.x * scale
                      }}/>
                {showActions ?
                    <IconButton style={{height: '20px', width: '20px', position: 'absolute', top: '0px', right: '0px'}}
                                onClick={this.deleteNode}>
                        <DeleteIcon style={{height: '20px', width: '20px'}}/>
                    </IconButton> :
                    null}
                {showActions ?
                    <IconButton style={{height: '20px', width: '20px', position: 'absolute', top: '0px', right: '20px'}}
                                onClick={() => {
                                    activateAttributeDrawer(activeNode);
                                }}>
                        <ModeEdit style={{height: '20px', width: '20px'}}/>
                    </IconButton> :
                    null}
            </div>);
    };

    connectionRender = () => {
        const {endPoints} = this.state,
            {activeNode} = this.props;

        if (endPoints.src.position && endPoints.dst.position) {
            return (<BasicConnection
                key={activeNode}
                path={[endPoints.src.position, endPoints.dst.position]}/>);
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

export default DragSource(DRAG_TYPES.GME_NODE, canvasItemSource, collect)(CanvasItem);