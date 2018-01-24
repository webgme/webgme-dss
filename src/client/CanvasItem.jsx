import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'react-svg';
import {DragSource} from 'react-dnd';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';

import {DRAG_TYPES} from './CONSTANTS';
import CanvasItemPort from './CanvasItemPort';
// import BasicConnection from './BasicConnection';
import Territory from './gme/BaseComponents/Territory';

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
        eventManager: PropTypes.object.isRequired
    };

    //TODO we need to gather the children info (new base class maybe)
    state = {
        position: null,
        name: null,
        showActions: false,
        modelicaUri: null,
        svgReady: false,
        ports: {},
        childrenName2Id: {},
        isConnection: null,
        currentRootHash: null,
        endPoints: null,
        territory: null,
        justRemovedIds: [],
        actualRootHash: null
    };

    constructor(props) {
        super(props);

        this.state.territory = {};
        this.state.territory[this.props.activeNode] = {children: 0};
    }

    onMouseEnter = () => {
        this.setState({showActions: true});
    };

    onMouseLeave = () => {
        this.setState({showActions: false});
    };

    deleteNode = () => {
        this.props.gmeClient.deleteNode(this.props.activeNode);
    };

    onSvgReady = (svgEl) => {
        if (this.state.svgReady)
            return;

        console.log('svgReady', svgEl.dataset.src);
        //TODO probably we need to move this to another function
        //TODO there is some small offset still

        let gItems = svgEl.querySelectorAll('g'),
            ports = {};
        gItems.forEach((item) => {
            if (item.id !== 'info') {
                let itemBox = item.getBBox();
                ports[item.id] = {
                    x: itemBox.x,
                    y: itemBox.y,
                    width: itemBox.width,
                    height: itemBox.height
                };
            }
        });
        this.setState({ports: ports, svgReady: true});
    };

    territoryUpdates = (hash, loads, updates, unloads) => {
        const {activeNode, gmeClient} = this.props;

        console.log('event-', hash, loads, updates, unloads);
        if (unloads.indexOf(activeNode) !== -1) {
            //main object have been unloaded so remove everything...
            this.setState({
                position: null,
                name: null,
                showActions: false,
                modelicaUri: null,
                svgReady: false,
                ports: {},
                childrenName2Id: {},
                isConnection: null,
                currentRootHash: null,
                endPoints: null,
                territory: null,
                justRemovedIds: [],
                actualRootHash: null
            });
            return;
        }

        let nodeObj = gmeClient.getNode(activeNode),
            metaNode = gmeClient.getNode(nodeObj.getMetaTypeId()),
            validPointers = nodeObj.getValidPointerNames(),
            isConnection = validPointers.indexOf('src') !== -1 && validPointers.indexOf('dst') !== -1,
            endPoints = null,
            modelicaUri = null,
            territory = {},
            childrenPaths = nodeObj.getChildrenIds(),
            childrenName2Id = {};

        if (isConnection) {
            endPoints = {
                src: nodeObj.getPointerId('src'),
                dst: nodeObj.getPointerId('dst')
            };
            territory[activeNode] = {children: 0};
        } else {
            modelicaUri = metaNode.getAttribute('ModelicaURI');
            childrenPaths.forEach((childPath) => {
                if (loads.indexOf(childPath) !== -1 || updates.indexOf(childPath) !== -1) {
                    let childNode = gmeClient.getNode(childPath);
                    childrenName2Id[childNode.getAttribute('name')] = childPath;
                }
            });
            territory[activeNode] = {children: 1};
        }

        this.setState({
            position: nodeObj.getRegistry('position'),
            name: nodeObj.getAttribute('name'),
            modelicaUri: modelicaUri,
            isConnection: isConnection,
            endPoints: endPoints,
            childrenName2Id: childrenName2Id,
            territory: territory,
            justRemovedIds: unloads,
            actualRootHash: hash
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
                eventManager
            } = this.props,
            {
                showActions,
                modelicaUri,
                ports,
                position,
                childrenName2Id,
                justRemovedIds,
                actualRootHash
            } = this.state,
            baseDimensions = {x: 320, y: 210};
        let portComponents = [],
            i, keys,
            svgPath = modelicaUri ? `/assets/DecoratorSVG/${modelicaUri}.svg` :
                '/assets/DecoratorSVG/Default.svg',
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
            eventManager.fire(event.id, {hash: actualRootHash, position: event.position});
        });

        // console.log('SP:', svgPath);
        // svgPath = '/assets/DecoratorSVG/Modelica.Electrical.Analog.Basic.Resistor.svg';
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
                <ReactSVG path={svgPath}
                          callback={this.onSvgReady}
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
            </div>);
    };

    connectionRender = () => {
        console.log('connection');
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
                onUpdate={this.territoryUpdates}/>
            {content}
        </div>);
    }

}

export default DragSource(DRAG_TYPES.GME_NODE, canvasItemSource, collect)(CanvasItem);