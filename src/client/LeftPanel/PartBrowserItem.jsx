import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragSource} from 'react-dnd';
import {getEmptyImage} from 'react-dnd-html5-backend';

// noinspection JSUnresolvedVariable
import {Samy, SvgProxy} from 'react-samy-svg';

import {DRAG_TYPES} from '../CONSTANTS';
import SVGCACHE from '../../plugins/MoveSVGToRegistryUtil/svgcache.json';

// / End of DragLayer..
const partBrowserItemSource = {
    beginDrag(props) {
        return {
            gmeId: props.nodeData.id,
            create: true,
            // Specifics
            nodeData: props.nodeData,
            offset: {
                y: SVGCACHE[props.nodeData.modelicaUri].bbox.height * (props.scale / 2),
                x: SVGCACHE[props.nodeData.modelicaUri].bbox.width * (props.scale / 2),
            },
        };
    },
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        connectDragPreview: connect.dragPreview(),
        isDragging: monitor.isDragging(),
    };
}

class PartBrowserItem extends Component {
    static propTypes = {
        nodeData: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string,
            modelicaUri: PropTypes.string,
            iconUrl: PropTypes.string,
        }).isRequired,
        connectDragSource: PropTypes.func.isRequired,
        connectDragPreview: PropTypes.func.isRequired,
        listView: PropTypes.bool,
    };

    static defaultProps = {
        listView: false,
    };

    componentDidMount() {
        const {connectDragPreview} = this.props;
        // Use empty image as a drag preview so browsers don't draw it
        // and we can draw whatever we want on the custom drag layer instead.
        connectDragPreview(getEmptyImage(), {
            // IE fallback: specify that we'd rather screenshot the node
            // when it already knows it's being dragged so we can hide it with CSS.
            captureDraggingState: true,
        });
    }

    render() {
        const {nodeData, connectDragSource, listView} = this.props;

        const content = (
            <div
                style={{
                    display: 'inline-flex',
                    width: '100%',
                    opacity: 0.99,
                    paddingTop: listView ? 10 : 0,
                    cursor: 'pointer',
                }}
            >
                <div>
                    <Samy
                        svgXML={SVGCACHE[nodeData.modelicaUri].base}
                        style={{
                            height: 26,
                            width: 40,
                            verticalAlign: 'middle',
                        }}
                    >
                        <SvgProxy selector="text" display="none"/>
                        <SvgProxy selector="*" stroke-width="0.75mm"/>
                    </Samy>
                </div>

                <div style={{
                    paddingTop: 5,
                    overflowX: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: 13,
                    display: listView ? 'none' : undefined,
                }}
                >
                    {nodeData.name}
                </div>
            </div>);

        return connectDragSource(content);
    }
}

export default DragSource(DRAG_TYPES.GME_NODE, partBrowserItemSource, collect)(PartBrowserItem);
