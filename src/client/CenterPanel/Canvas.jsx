import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {DropTarget} from 'react-dnd';
import {Link} from 'react-router-dom';
import Card, {CardActions, CardContent} from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';

import SVGCACHE from './../../svgcache.json';

import SingleConnectedNode from '../gme/BaseComponents/SingleConnectedNode';
import {DRAG_TYPES} from '../CONSTANTS';
import CanvasItem from './CanvasItem';
import ConnectionManager from '../gme/BaseComponents/ConnectionManager';
import BasicConnectingComponent from '../gme/BaseComponents/BasicConnectingComponent';
import BasicEventManager from '../gme/BaseComponents/BasicEventManager';
import {toggleRightDrawer, setActiveSelection} from '../actions';
import getIndexedName from '../gme/utils/getIndexedName';

import ZLEVELS from '../gme/utils/zLevels';

// TODO we anly take loaded children into account
function getChildrenNames(gmeClient, nodeId) {
    const container = gmeClient.getNode(nodeId),
        childrenIds = container.getChildrenIds();
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
            let offset = monitor.getDifferenceFromInitialOffset(),
                node = props.gmeClient.getNode(dragItem.gmeId),
                position = node.getRegistry('position');

            position.x += offset.x / props.scale;
            position.y += offset.y / props.scale;

            position.x = Math.trunc(position.x);
            position.y = Math.trunc(position.y);

            props.gmeClient.setRegistry(dragItem.gmeId, 'position', position);
        } else if (dragItem.create) {
            const dragOffset = monitor.getClientOffset(),
                metaNode = props.gmeClient.getNode(dragItem.gmeId);

            let position = {
                    x: (dragOffset.x - canvas.offset.x + canvas.props.scrollPos.x) / props.scale,
                    y: (dragOffset.y - canvas.offset.y + canvas.props.scrollPos.y) / props.scale,
                },
                name = metaNode.getAttribute('ShortName') || metaNode.getAttribute('name');

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

function collect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
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

    offset = {x: 0, y: 0};

    constructor(props) {
        super(props);
        this.cm = new ConnectionManager();
        this.em = new BasicEventManager();
    }

    populateChildren(nodeObj) {
        let childrenIds = nodeObj.getChildrenIds(),
            newChildren;

        newChildren = childrenIds.map(id => ({id}));
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
                        this.offset = {x: canvas.offsetParent.offsetLeft, y: canvas.offsetParent.offsetTop};
                    }
                }}
                style={{
                    backgroundColor: dragMode === 'create' ? 'lightgreen' : undefined,
                    width: '100%',
                    height: '100%',
                    overflow: 'scroll',
                    zIndex: ZLEVELS.canvas,
                    position: 'absolute',
                }}
                onClick={this.onMouseClick}
                onContextMenu={this.onMouseClick}
                onMouseLeave={this.onMouseLeave}
                onMouseMove={this.onMouseMove}
            >
                <BasicConnectingComponent connectionManager={this.cm}/>
                {/* <div style={{ */}
                {/* position: 'sticky', */}
                {/* top: '5%', */}
                {/* left: '5%', */}
                {/* right: '95%', */}
                {/* bottom: '95%', */}
                {/* fontSize: '24px', */}
                {/* opacity: 0.3, */}
                {/* zIndex: 2 */}
                {/* }}>{`Node ${nodeInfo.name} open`}</div> */}
                {childrenItems.length > 0 ?
                    childrenItems :
                    <div style={{
                        position: 'absolute',
                        maxWidth: 600,
                        left: 'calc(50% - 300px)',
                        top: '20%',
                    }}
                    >
                        <Card>
                            <CardContent>
                                <Typography style={{marginBottom: 20}} variant="headline" component="h2">
                                    This is your canvas
                                </Typography>
                                <Typography component="p">
                                    Use the left menu to add components to your system. Locate which components you
                                    need and drag and drop them onto this Canvas. Based on their interfaces you can wire
                                    components together by clicking the port icons. <br/><br/>
                                    To set the parameter simply double-click it and the parameter editor will show up.
                                    From there you can click the inlined icon and it will take you to the official
                                    Modelica® Standard Library documentation.
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    color="primary"
                                    component={Link}
                                    to="http://doc.modelica.org/om/Modelica.html"
                                    target="_blank"
                                >
                                    Learn More About Modelica
                                </Button>
                            </CardActions>
                        </Card>
                    </div>
                }
            </div>);

        return connectDropTarget(content);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(
    DropTarget(DRAG_TYPES.GME_NODE, canvasTarget, collect)(Canvas));
