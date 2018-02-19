import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragLayer} from 'react-dnd';

// noinspection JSUnresolvedVariable
import {Samy} from 'react-samy-svg';
import {connect} from 'react-redux';
import {DRAG_TYPES} from '../CONSTANTS';
import SVGCACHE from '../../svgcache';

const mapStateToProps = state => ({
    scale: state.scale,
});

const mapDispatchToProps = (/* dispatch */) => ({});

// DragLayer
function collect(monitor) {
    return {
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        currentOffset: monitor.getClientOffset(),
        initialOffset: monitor.getInitialClientOffset(),
        isDragging: monitor.isDragging(),
    };
}

class PartBrowserDragPreview extends Component {
    static propTypes = {
        item: PropTypes.object,
        itemType: PropTypes.string,
        currentOffset: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
        }),
        initialOffset: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
        }),
        isDragging: PropTypes.bool.isRequired,
        scale: PropTypes.number.isRequired,
    };

    render() {
        const {
            item, itemType, isDragging, currentOffset, initialOffset, scale,
        } = this.props;

        if (!isDragging || !item || itemType !== DRAG_TYPES.GME_NODE ||
            !item.nodeData || !currentOffset || !initialOffset) {
            return null;
        }

        const {x, y} = {x: currentOffset.x - initialOffset.x, y: currentOffset.y - initialOffset.y},
            transform = `translate(${x}px, ${y}px)`,
            {base, bbox} = SVGCACHE[item.nodeData.modelicaUri];
        return (
            <Samy
                svgXML={base}
                style={{
                    position: 'absolute',
                    top: initialOffset.y - item.offset.y,
                    left: initialOffset.x - item.offset.x,
                    zIndex: 1300,
                    height: bbox.height * scale,
                    width: bbox.width * scale,
                    pointerEvents: 'none',
                    // verticalAlign: 'middle',
                    transform,
                    WebkitTransform: transform,
                }}
            />
        );
    }
}

export default DragLayer(collect)(connect(mapStateToProps, mapDispatchToProps)(PartBrowserDragPreview));
