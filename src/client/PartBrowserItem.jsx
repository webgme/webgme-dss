import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';

import Chip from 'material-ui/Chip';

import {DRAG_TYPES} from './CONSTANTS';

const partBrowserItemSource = {
    beginDrag(props) {
        return {
            gmeId: props.treeNode.id,
            create: true
        };
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

class PartBrowserItem extends Component {
    //constructor(props) {
    //    super(props);
    //}

    componentDidMount() {
        console.log('componentDidMount PartBrowserItem', this.props.treeNode.name);
    }

    render() {
        const {treeNode, connectDragSource, isDragging} = this.props;

        return connectDragSource(
            <div style={{opacity: 0.99}}>
                <Chip style={{fontWeight: isDragging ? 'bold' : 'normal'}} label={treeNode.name}/>
            </div>);
    }
}

PartBrowserItem.propTypes = {
    treeNode: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        active: PropTypes.boolean
    }),

    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired
};

export default DragSource(DRAG_TYPES.GME_NODE, partBrowserItemSource, collect)(PartBrowserItem);