import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragLayer} from 'react-dnd';

import {Samy} from 'react-samy-svg';

import {DRAG_TYPES} from './CONSTANTS';

// DragLayer
function collect(monitor) {
    return {
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        currentOffset: monitor.getClientOffset(),
        initialOffset: monitor.getInitialClientOffset(),
        isDragging: monitor.isDragging()
    };
}

class PartBrowserDragPreview extends Component {
    render() {
        const { item, itemType, isDragging, currentOffset, initialOffset, scale } = this.props;
        if (!isDragging || !item || itemType !== DRAG_TYPES.GME_NODE ||
            !item.treeNode || !currentOffset || !initialOffset) {
            return null;
        }

        const { x, y } = { x: currentOffset.x - initialOffset.x, y: currentOffset.y - initialOffset.y};
        const transform = `translate(${x}px, ${y}px)`;
        return (
            <Samy path={item.treeNode.iconUrl}
                  style={{
                      position: 'absolute',
                      top: initialOffset.y - item.offset.y,
                      left: initialOffset.x - item.offset.x,
                      zIndex: 1300,
                      height: 210 * scale,
                      width: 320 * scale,
                      pointerEvents: 'none',
                      //verticalAlign: 'middle',
                      transform: transform,
                      WebkitTransform: transform
                  }}>
            </Samy>
        );
    }
}

PartBrowserDragPreview.propTypes = {
    item: PropTypes.object,
    itemType: PropTypes.string,
    currentOffset: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
    }),
    initialOffset: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
    }),
    isDragging: PropTypes.bool.isRequired,
    scale: PropTypes.number.isRequired
};

export default DragLayer(collect)(PartBrowserDragPreview);