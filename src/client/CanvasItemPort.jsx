import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class CanvasItemPort extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        connectionManager: PropTypes.object.isRequired,
        activeNode: PropTypes.string.isRequired,
        contextNode: PropTypes.string.isRequired,
        position: PropTypes.object,
        dimensions: PropTypes.object,
        hidden: PropTypes.bool.isRequired,
        absolutePosition: PropTypes.object.isRequired
    };

    state = {
        freeze: false,
        mouseOver: false
    };

    createConnection = (source, type) => {
        let {gmeClient, activeNode, contextNode} = this.props,
            connectionId;

        gmeClient.startTransaction('creating a connection');
        connectionId = gmeClient.createNode({base: type, parent: contextNode});
        gmeClient.setPointer(connectionId, 'src', source);
        gmeClient.setPointer(connectionId, 'dst', activeNode);
        gmeClient.completeTransaction('connection created');
    };

    onClick = (/*event*/) => {
        let self = this,
            {connectionManager, activeNode, absolutePosition, dimensions} = this.props;

        if (connectionManager.isConnecting) {
            let connectionParams = connectionManager.endConnection();
            if (connectionParams.source !== activeNode) {
                this.createConnection(connectionParams.source, connectionParams.type);
            }
            this.setState({freeze: false});
        } else {

            connectionManager.startConnection(activeNode, 'someConnectionType', {
                x: absolutePosition.x + (dimensions.x / 2),
                y: absolutePosition.y + (dimensions.y / 2)
            }, () => {
                self.setState({freeze: false});
            });
            this.setState({freeze: true});
        }
    };

    onMouseEnter = () => {
        this.setState({mouseOver: true});
    };

    onMouseLeave = () => {
        this.setState({mouseOver: false});
    };

    render() {
        let {hidden, position, dimensions} = this.props,
            {freeze, mouseOver} = this.state,
            left, top, width, height, border;

        if (hidden && !freeze) {
            return null;
        }
        left = mouseOver ? (position ? position.x - 5 : 0) + 'px' : (position ? position.x : 0) + 'px';
        top = mouseOver ? (position ? position.y - 5 : 0) + 'px' : (position ? position.y : 0) + 'px';
        width = mouseOver ? (dimensions ? dimensions.x + 10 : 15) + 'px' : (dimensions ? dimensions.x : 5) + 'px';
        height = mouseOver ? (dimensions ? dimensions.y + 10 : 15) + 'px' : (dimensions ? dimensions.y : 5) + 'px';
        border = mouseOver ? '2px solid #000000' : '1px solid #000000';

        return (<div style={{
            position: 'absolute',
            left: left,
            top: top,
            width: width,
            height: height,
            border: border
        }}
                     onMouseEnter={this.onMouseEnter}
                     onMouseLeave={this.onMouseLeave}
                     onClick={this.onClick}/>);
    }

}