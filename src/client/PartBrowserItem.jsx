import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend'

import {Samy, SvgProxy} from 'react-samy-svg';
import Typography from 'material-ui/Typography';

import {DRAG_TYPES} from './CONSTANTS';

/// End of DragLayer..
const partBrowserItemSource = {
    beginDrag(props) {
        return {
            gmeId: props.treeNode.id,
            create: true,
            // Specifics
            treeNode: props.treeNode,
            offset: {
                y: 210 * props.scale / 2,
                x: 320 * props.scale / 2
            }
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

class PartBrowserItem extends Component {
    // constructor(props) {
    //    super(props);
    // }

    componentDidMount() {
        // Use empty image as a drag preview so browsers don't draw it
        // and we can draw whatever we want on the custom drag layer instead.
        this.props.connectDragPreview(getEmptyImage(), {
            // IE fallback: specify that we'd rather screenshot the node
            // when it already knows it's being dragged so we can hide it with CSS.
            captureDraggingState: true
        });
    }

    onSVGReady = (svgEl) => {
        //TODO: Handle non-existing svg!
    };

    render() {
        const {treeNode, connectDragSource} = this.props;

        return connectDragSource(
            <div style={{opacity: 0.99}}>
                <span><Samy path={treeNode.iconUrl}
                                                onSVGReady={this.onSVGReady}
                                                style={{
                                                    height: '100%',
                                                    width: 40,
                                                    verticalAlign: 'middle'
                                                }}>
                    <SvgProxy selector="text" display={'none'}/>
                    <SvgProxy selector="*" stroke-width={'0.75mm'}/>
                </Samy></span>
                <Typography style={{display: 'inline', verticalAlign: 'middle'}}>{treeNode.name}</Typography>
            </div>);
    }
}

PartBrowserItem.propTypes = {
    treeNode: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string,
        iconUrl: PropTypes.string
    }),
    scale: PropTypes.number.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    connectDragPreview: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired
};

export default DragSource(DRAG_TYPES.GME_NODE, partBrowserItemSource, collect)(PartBrowserItem);