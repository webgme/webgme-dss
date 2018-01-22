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
        hidden: PropTypes.bool.isRequired
    };

    state = {
        freeze: false
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

    onClick = (event) => {
        let self = this,
            {connectionManager, activeNode} = this.props;
        if (connectionManager.isConnecting) {
            let connectionParams = connectionManager.endConnection();
            if (connectionParams.source !== activeNode) {
                this.createConnection(connectionParams.source, connectionParams.type);
            }
            this.setState({freeze: false});
        } else {
            connectionManager.startConnection(activeNode, 'someConnectionType', {
                x: event.clientX,
                y: event.clientY
            }, () => {
                self.setState({freeze: false});
            });
            this.setState({freeze: true});
        }
    };

    render() {
        let {hidden, position, dimensions} = this.props,
            {freeze} = this.state;

        return hidden && !freeze ? null :
            (<div style={{
                position: 'absolute',
                left: (position ? position.x : 0) + 'px',
                top: (position ? position.y : 0) + 'px',
                width: (dimensions ? dimensions.x : 5) + 'px',
                height: (dimensions ? dimensions.y : 5) + 'px',
                border: "1px solid #000000"
            }}
                  onClick={this.onClick}/>);
    }

}