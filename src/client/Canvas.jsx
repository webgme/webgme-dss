import React from 'react';
import PropTypes from 'prop-types';
import {DropTarget} from 'react-dnd';

import SingleConnectedNode from './gme/BaseComponents/SingleConnectedNode';
import {DRAG_TYPES} from './CONSTANTS';
import CanvasItem from "./CanvasItem";
import ConnectionManager from './gme/BaseComponents/ConnectionManager';
import BasicConnectingComponent from './gme/BaseComponents/BasicConnectingComponent';
import BasicEventManager from './gme/BaseComponents/BasicEventManager';

import BasicConnection from './BasicConnection';

const canvasTarget = {
    drop(props, monitor, canvas) {
        const dragItem = monitor.getItem();
        if (dragItem.move) {
            let offset = monitor.getDifferenceFromInitialOffset(),
                node = props.gmeClient.getNode(dragItem.gmeId),
                position = node.getRegistry('position');

            position.x = position.x + Math.trunc(offset.x);
            position.y = position.y + Math.trunc(offset.y);
            props.gmeClient.setRegistry(dragItem.gmeId, 'position', position);
        } else if (dragItem.create) {
            const dragOffset = monitor.getClientOffset();
            const position = {
                x: dragOffset.x - canvas.offset.x + canvas.props.scrollPos.x,
                y: dragOffset.y - canvas.offset.y + canvas.props.scrollPos.y
            };

            props.gmeClient.createNode({
                parentId: props.activeNode,
                baseId: dragItem.gmeId
            }, {
                registry: {
                    position
                }
            });
        }
    }
};

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    };
}

class Canvas extends SingleConnectedNode {
    state = {
        children: [],
        nodeInfo: {}
    };

    cm = null;
    em = null;

    offset = {x: 0, y: 0};

    constructor(props) {
        super(props);
        this.cm = new ConnectionManager();
        this.em = new BasicEventManager();
    }

    populateChildren(nodeObj, initial) {
        var childrenIds = nodeObj.getChildrenIds();

        this.setState({
            children: childrenIds.map((id) => {
                return {id: id};
            }),
            nodeInfo: {
                name: nodeObj.getAttribute('name')
            }
        });
    }

    onNodeLoad(nodeObj) {
        this.populateChildren(nodeObj, true);
    }

    onNodeUpdate(nodeObj) {
        this.populateChildren(nodeObj);
    }

    onMouseClick = (event) => {
        event.stopPropagation();
        event.preventDefault();
        if (this.cm.isConnecting) {
            this.cm.endConnection();
        }
    };

    onMouseLeave = (event) => {
        event.stopPropagation();
        if (this.cm.isConnecting) {
            this.cm.endConnection();
        }
    };

    onMouseMove = (event) => {
        // console.log('e:', event.clientX, 's:', this.props.scrollPos.x, 'o:', this.offset.x);
        this.cm.onMouseMove({
            x: event.clientX + this.props.scrollPos.x - this.offset.x,
            y: event.clientY + this.props.scrollPos.y - this.offset.y
        });
    };

    render() {
        const {connectDropTarget, isOver, activeNode} = this.props,
            self = this;

        let children = this.state.children.map((child) => {
            return (<CanvasItem
                key={child.id}
                gmeClient={this.props.gmeClient}
                activeNode={child.id}
                contextNode={activeNode}
                connectionManager={self.cm}
                eventManager={self.em}/>);
        });
        return connectDropTarget(
            <div ref={(canvas) => {
                if (canvas)
                    self.offset = {x: canvas.offsetParent.offsetLeft, y: canvas.offsetParent.offsetTop};
            }}
                 style={{
                     backgroundColor: isOver ? 'lightgreen' : undefined,
                     width: '100%',
                     height: '100%',
                     overflow: 'scroll',
                     zIndex: 1,
                     position: 'absolute'
                 }}
                /*onClick={this.onMouseClick}*/
                 onContextMenu={this.onMouseClick}
                 onMouseLeave={this.onMouseLeave}
                 onMouseMove={this.onMouseMove}>
                <BasicConnectingComponent connectionManager={this.cm}/>
                <div style={{
                    position: 'sticky',
                    top: '10px',
                    left: '10px'
                }}>{`Node ${this.state.nodeInfo.name} open`}</div>
                {children}
                <BasicConnection path={[{x: 100, y: 100}, {x: 150, y: 100}, {x: 150, y: 150}]}/>
            </div>);
    }
}

Canvas.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    activeNode: PropTypes.string.isRequired,
    scrollPos: PropTypes.object.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired
};

export default DropTarget(DRAG_TYPES.GME_NODE, canvasTarget, collect)(Canvas);