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

    //TODO we need to gather the children info (new base class maybe)
    state = {
        position: null,
        name: null,
        showActions: false,
        modelicaUri: null,
        ports: []
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
        this.props.gmeClient.deleteNode(this.props.activeNode);
    };

    onNodeLoad(nodeObj) {
        this.getNodeParameters(nodeObj);
    }

    onNodeUpdate(nodeObj) {
        this.getNodeParameters(nodeObj);
    }

    onSvgReady = (svgEl) => {
        //TODO probably we need to move this to another function
        //TODO there is some small offset still

        let gItems = svgEl.querySelectorAll('g'),
            ports = [];
        gItems.forEach((item) => {
            if (item.id !== 'info') {
                let itemBox = item.getBBox();
                ports.push({
                    id: item.id,
                    x: itemBox.x,
                    y: itemBox.y,
                    width: itemBox.width,
                    height: itemBox.height
                });
            }
        });
        this.setState({ports: ports});
    };

    render() {

        const {
                connectDragSource,
                isDragging,
                gmeClient,
                contextNode,
                connectionManager,
                activeNode
            } = this.props,
            {showActions, modelicaUri, ports} = this.state,
            baseDimensions = {x: 320, y: 210},
            scale = 0.3,
            svgPath = modelicaUri ? `/assets/DecoratorSVG/${modelicaUri}.svg` : '/assets/DecoratorSVG/Default.svg';
        let portComponents;

        if (this.state.position === null) {
            return <div>loading...</div>;
        }

        portComponents = ports.map((port, index) => {
            return (<CanvasItemPort
                key={index}
                gmeClient={gmeClient}
                connectionManager={connectionManager}
                activeNode={activeNode}
                contextNode={contextNode}
                position={{x: scale * port.x, y: scale * port.y}}
                dimensions={{x: scale * port.width, y: scale * port.height}}
                hidden={!showActions}/>);
        });

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
                {portComponents}
                <Samy path={svgPath}
                      onSVGReady={this.onSvgReady}
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