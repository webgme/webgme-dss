import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import { Samy, SvgProxy } from 'react-samy-svg';

import Typography from 'material-ui/Typography';

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
    onSVGReady = (svgEl) => {
        // FIXME: How are errors reported? so we can fall back on Default.svg
        console.log(svgEl);
    };

    render() {
        const {treeNode, connectDragSource, isDragging} = this.props;
        // TODO: Change dragged element to svg
        return connectDragSource(
            <div style={{opacity: 0.99}}>
                <Samy path={treeNode.iconUrl} onSVGReady={this.onSVGReady}
                      style={{height: '100%', width: 40, verticalAlign: 'middle'}}>
                    <SvgProxy selector="text" display={'none'} />
                    <SvgProxy selector="*" stroke-width={'0.75mm'} />
                </Samy>
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

    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired
};

export default DragSource(DRAG_TYPES.GME_NODE, partBrowserItemSource, collect)(PartBrowserItem);