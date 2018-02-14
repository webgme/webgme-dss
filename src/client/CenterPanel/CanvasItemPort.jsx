import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ZLEVELS} from '../gme/utils/zLevels';

export default class CanvasItemPort extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        connectionManager: PropTypes.object.isRequired,
        activeNode: PropTypes.string.isRequired,
        contextNode: PropTypes.string.isRequired,
        position: PropTypes.object,
        dimensions: PropTypes.object,
        hidden: PropTypes.bool.isRequired,
        absolutePosition: PropTypes.object.isRequired,
        validTypes: PropTypes.object.isRequired
    };

    state = {
        freeze: false,
        mouseOver: false
    };

    constructor(/*props*/) {
        super();
        //console.count('CanvasItemPort:ctor');
    }

    createConnection = (source, type) => {
        let {gmeClient, activeNode, contextNode} = this.props,
            connectionId;

        gmeClient.startTransaction('creating a connection');
        connectionId = gmeClient.createNode({baseId: type, parentId: contextNode});
        gmeClient.setPointer(connectionId, 'src', source);
        gmeClient.setPointer(connectionId, 'dst', activeNode);
        gmeClient.completeTransaction('connection created');
    };

    onClick = (event) => {
        let self = this,
            {connectionManager, activeNode, absolutePosition, dimensions, validTypes} = this.props;

        event.stopPropagation();
        event.preventDefault();

        if (connectionManager.isConnecting) {
            let connectionParams = connectionManager.endConnection();
            if (connectionParams.source !== activeNode) {
                this.createConnection(connectionParams.source, connectionParams.type);
            }
            this.setState({freeze: false});
        } else {

            connectionManager.startConnection(activeNode, validTypes.src, {
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
        let {hidden, position, dimensions, validTypes, connectionManager} = this.props,
            {freeze, mouseOver} = this.state,
            left, top, width, height, border;

        if (!freeze) {
            if (hidden) {
                return null;
            }

            if (connectionManager.isConnecting) {
                // It's connecting - is it a valid destination?
                if (validTypes.dst !== connectionManager.type) {
                    return null;
                }
            } else {
                // It's NOT connecting - is it a valid source?
                if (validTypes.src === undefined) {
                    return null;
                }
            }
        }

        left = mouseOver ? (position ? position.x - 5 : 0) + 'px' : (position ? position.x : 0) + 'px';
        top = mouseOver ? (position ? position.y - 5 : 0) + 'px' : (position ? position.y : 0) + 'px';
        width = mouseOver ? (dimensions ? dimensions.x + 8 : 13) + 'px' : (dimensions ? dimensions.x : 5) + 'px';
        height = mouseOver ? (dimensions ? dimensions.y + 8 : 13) + 'px' : (dimensions ? dimensions.y : 5) + 'px';
        border = mouseOver ? '2px solid #000000' : '1px solid #000000';

        return (<div style={{
            position: 'absolute',
            backgroundColor: mouseOver ? 'lightgreen' : undefined,
            opacity: 0.5,
            left: left,
            top: top,
            width: width,
            height: height,
            border: border,
            zIndex: ZLEVELS.port
        }}
                     onMouseEnter={this.onMouseEnter}
                     onMouseLeave={this.onMouseLeave}
                     onClick={this.onClick}/>);
    }

}