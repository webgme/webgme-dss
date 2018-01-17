import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';

import Chip from 'material-ui/Chip';

import SingleConnectedNode from './gme/BaseComponents/SingleConnectedNode';
import { DRAG_TYPES } from './CONSTANTS';

const canvasTarget = {
    drop(props, monitor) {
        const dragItem = monitor.getItem();

        props.gmeClient.createNode({
            parentId: props.activeNode,
            baseId: dragItem.gmeId
        }, {
            registry: {
                position:{ x: 100, y: 100}
            }
        });
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

    //constructor(props) {
    //    super(props);
    //}

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

    render() {
        const {connectDropTarget, isOver} = this.props;

        let children = this.state.children.map((child) => {
            return <Chip key={child.id} label={child.id}/>
        });

        return connectDropTarget(
            <div style={{backgroundColor: isOver ? 'lightgreen' : undefined , width: '100%', height: '100%'}}>
                {`Node ${this.state.nodeInfo.name} open`}
                {children}
        </div>);
    }
}

Canvas.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    activeNode: PropTypes.string.isRequired,

    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired
};

export default DropTarget(DRAG_TYPES.GME_NODE, canvasTarget, collect)(Canvas);