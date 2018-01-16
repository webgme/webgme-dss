import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { DragSource } from 'react-dnd';

import Chip from 'material-ui/Chip';

import { DRAG_TYPES } from './CONSTANTS';

const partBrowserItemSource = {
    beginDrag(props) {
        return {
            gmeId: props.treeNode.id
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

    render() {
        const { treeNode, connectDragSource, isDragging } = this.props;

        return connectDragSource(
            <div>
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