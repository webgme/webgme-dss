import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {DropTarget} from 'react-dnd';

import SVGCACHE from '../../../svgcache.json';

import SingleConnectedNode from '../../gme/BaseComponents/SingleConnectedNode';
import {DRAG_TYPES} from '../../CONSTANTS';
import CanvasItem from './CanvasItem';
import ConnectionManager from '../../gme/BaseComponents/ConnectionManager';
import BasicConnectingComponent from '../../gme/BaseComponents/BasicConnectingComponent';
import BasicEventManager from '../../gme/BaseComponents/BasicEventManager';
import {toggleRightDrawer, setActiveSelection} from '../../actions';
import getIndexedName from '../../gme/utils/getIndexedName';

import ZLEVELS from '../../gme/utils/zLevels';
import CanvasInfoCard from './CanvasInfoCard';

// TODO we anly take loaded children into account
function getChildrenNames(gmeClient, nodeId) {
    const container = gmeClient.getNode(nodeId);
    const childrenIds = container.getChildrenIds();
    const names = [];

    childrenIds.forEach((childId) => {
        const node = gmeClient.getNode(childId);
        if (node) {
            names.push(node.getAttribute('name'));
        }
    });

    return names;
}

const canvasTarget = {
    drop(props, monitor, canvas) {
        const dragItem = monitor.getItem();
        if (dragItem.move) {
            const offset = monitor.getDifferenceFromInitialOffset();
            const node = props.gmeClient.getNode(dragItem.gmeId);
            const position = node.getRegistry('position');

            position.x += offset.x / props.scale;
            position.y += offset.y / props.scale;

            position.x = Math.trunc(position.x);
            position.y = Math.trunc(position.y);

            props.gmeClient.setRegistry(dragItem.gmeId, 'position', position);
        } else if (dragItem.create) {
            const dragOffset = monitor.getClientOffset();
            const metaNode = props.gmeClient.getNode(dragItem.gmeId);
            const position = {
                x: ((dragOffset.x - canvas.offset.x) + canvas.props.scrollPos.x) / props.scale,
                y: ((dragOffset.y - canvas.offset.y) + canvas.props.scrollPos.y) / props.scale,
            };
            let name = metaNode.getAttribute('ShortName') || metaNode.getAttribute('name');

            name = getIndexedName(name, getChildrenNames(props.gmeClient, props.activeNode));

            position.x -= SVGCACHE[dragItem.nodeData.modelicaUri].bbox.width / 2;
            position.y -= SVGCACHE[dragItem.nodeData.modelicaUri].bbox.height / 2;

            position.x = Math.trunc(position.x);
            position.y = Math.trunc(position.y);

            // TODO: Fix when client accepts 0
            position.x = position.x > 0 ? position.x : 1;
            position.y = position.y > 0 ? position.y : 1;

            props.gmeClient.createNode({
                parentId: props.activeNode,
                baseId: dragItem.gmeId,
            }, {
                attributes: {
                    name,
                },
                registry: {
                    position,
                },
            });
        }

        canvas.setState({dragMode: 'none'});
    },
    hover(props, monitor, component) {
        const item = monitor.getItem();
        let dragState;
        if (item.create) {
            dragState = 'create';
        }
        if (item.move) {
            dragState = 'move';
        }

        component.setState({dragMode: dragState});
    },
};

function collect(connector, monitor) {
    return {
        connectDropTarget: connector.dropTarget(),
        isOver: monitor.isOver(),
    };
}

const mapStateToProps = state => ({
    activeNode: state.activeNode,
    selection: state.activeSelection,
    scale: state.scale,
});

const mapDispatchToProps = dispatch => ({
    hide: () => {
        dispatch(toggleRightDrawer(false));
    },
    clearSelection: () => {
        dispatch(setActiveSelection([]));
        dispatch(toggleRightDrawer(false));
    },
});

class Canvas extends SingleConnectedNode {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        scrollPos: PropTypes.object.isRequired,

        activeNode: PropTypes.string.isRequired,
        scale: PropTypes.number.isRequired,

        connectDropTarget: PropTypes.func.isRequired,
        isOver: PropTypes.bool.isRequired,
    };

    state = {
        children: [],
        nodeInfo: {},
        dragMode: 'none',
    };

    cm = null;
    em = null;

    offset = {
        x: 0,
        y: 0,
    };

    constructor(props) {
        super(props);
        this.cm = new ConnectionManager();
        this.em = new BasicEventManager();
    }

    populateChildren(nodeObj) {
        const childrenIds = nodeObj.getChildrenIds();
        const newChildren = childrenIds.map(id => ({id}));

        this.setState({
            children: newChildren,
            nodeInfo: {
                name: nodeObj.getAttribute('name'),
            },
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
        this.props.clearSelection();
    };

    onMouseLeave = (event) => {
        event.stopPropagation();
        if (this.cm.isConnecting) {
            this.cm.endConnection();
        }
    };

    onMouseMove = (event) => {
        const {scrollPos} = this.props;
        this.cm.onMouseMove({
            x: event.clientX + (scrollPos.x - this.offset.x),
            y: event.clientY + (scrollPos.y - this.offset.y),
        });
    };

    render() {
        const {connectDropTarget, activeNode, gmeClient} = this.props;
        const {children, dragMode} = this.state;

        const childrenItems = children.map(child => (<CanvasItem
            key={child.id}
            gmeClient={gmeClient}
            activeNode={child.id}
            contextNode={activeNode}
            connectionManager={this.cm}
            eventManager={this.em}
        />));

        const content = (
            <div
                ref={(canvas) => {
                    if (canvas) {
                        const {offsetLeft, offsetTop} = canvas.offsetParent;

                        this.offset = {
                            x: offsetLeft,
                            y: offsetTop,
                        };
                    }
                }}
                style={{
                    backgroundColor: dragMode === 'create' ? 'lightgreen' : undefined,
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    zIndex: ZLEVELS.canvas,
                    position: 'absolute',
                }}
                role="presentation"
                onClick={this.onMouseClick}
                onContextMenu={this.onMouseClick}
                onMouseLeave={this.onMouseLeave}
                onMouseMove={this.onMouseMove}
            >
                <BasicConnectingComponent connectionManager={this.cm}/>
                {childrenItems.length > 0 ? childrenItems : CanvasInfoCard()}
            </div>);

        return connectDropTarget(content);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DropTarget(
    DRAG_TYPES.GME_NODE,
    canvasTarget,
    collect,
)(Canvas));
