import React from 'react';
import PropTypes from 'prop-types';
import {Samy /*, SvgProxy*/} from 'react-samy-svg';
import {DragSource} from 'react-dnd';
import IconButton from 'material-ui/IconButton';
import DeleteIcon from 'material-ui-icons/Delete';

import {DRAG_TYPES} from './CONSTANTS';
import SingleConnectedNode from "./gme/BaseComponents/SingleConnectedNode";
import CanvasItemPort from './CanvasItemPort';

const canvasItemSource = {
    beginDrag(props) {
        return {
            gmeId: props.activeNode,
            move: true,
            copy: false
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

class CanvasItem extends SingleConnectedNode {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        activeNode: PropTypes.string.isRequired,
        connectDragSource: PropTypes.func.isRequired,
        connectDragPreview: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired,
        contextNode: PropTypes.string.isRequired,
        connectionManager: PropTypes.object.isRequired
    };

    state = {
        position: null,
        name: null,
        showActions: false,
        modelicaUri: null
    };

    getNodeParameters(nodeObj) {
        const metaNode = this.props.gmeClient.getNode(nodeObj.getMetaTypeId());

        this.setState({
            position: nodeObj.getRegistry('position'),
            name: nodeObj.getAttribute('name'),
            modelicaUri: metaNode.getAttribute('ModelicaURI')
        });
    }

    onMouseEnter = () => {
        this.setState({showActions: true});
    };

    onMouseLeave = () => {
        this.setState({showActions: false});
    };

    deleteNode = () => {
        console.log(this.props.activeNode);
        this.props.gmeClient.deleteNode(this.props.activeNode);
    };

    onNodeLoad(nodeObj) {
        this.getNodeParameters(nodeObj);
    }

    onNodeUpdate(nodeObj) {
        this.getNodeParameters(nodeObj);
    }

    render() {

        const {
                connectDragSource,
                isDragging,
                gmeClient,
                contextNode,
                connectionManager,
                activeNode
            } = this.props,
            {showActions, modelicaUri} = this.state,
            baseDimensions = {x: 320, y: 210},
            scale = 0.3,
            svgPath = modelicaUri ? `/assets/DecoratorSVG/${modelicaUri}.svg` : '/assets/DecoratorSVG/Default.svg';

        if (this.state.position === null) {
            return <div>loading...</div>;
        }

        return connectDragSource(
            <div style={{
                opacity: isDragging ? 0.3 : 0.99,
                position: 'relative',
                top: this.state.position.y,
                left: this.state.position.x,
                height: baseDimensions.y * scale,
                width: baseDimensions.x * scale,
                border: showActions ? "1px dashed #000000" : "0px",
                zIndex: 10
            }}
                 onMouseEnter={this.onMouseEnter}
                 onMouseLeave={this.onMouseLeave}
            >
                <CanvasItemPort
                    gmeClient={gmeClient}
                    connectionManager={connectionManager}
                    activeNode={activeNode}
                    contextNode={contextNode}
                    hidden={!showActions}/>
                <Samy path={svgPath}
                      style={{
                          height: baseDimensions.y * scale,
                          width: baseDimensions.x * scale
                      }}/>
                {showActions ?
                    <IconButton style={{height: '20px', width: '20px', position: 'absolute', top: '0px', right: '0px'}}
                                onClick={this.deleteNode}>
                        <DeleteIcon style={{height: '20px', width: '20px'}}/>
                    </IconButton> :
                    null}
            </div>);
    }

}

export default DragSource(DRAG_TYPES.GME_NODE, canvasItemSource, collect)(CanvasItem);