import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ZLEVELS from '../../gme/utils/zLevels';

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
        validTypes: PropTypes.object.isRequired,
    };

    static defaultProps = {
        position: {
            x: 0,
            y: 0,
        },
        dimensions: {
            x: 20,
            y: 20,
        },
    };

    state = {
        freeze: false,
        mouseOver: false,
    };

    onClick = (event) => {
        const self = this;
        const {
            connectionManager, activeNode, absolutePosition, dimensions, validTypes,
        } = this.props;

        event.stopPropagation();
        event.preventDefault();

        if (connectionManager.isConnecting) {
            const connectionParams = connectionManager.endConnection();
            if (connectionParams.source !== activeNode) {
                this.createConnection(connectionParams.source, connectionParams.type);
            }
            this.setState({freeze: false});
        } else {
            connectionManager.startConnection(activeNode, validTypes.src, {
                x: absolutePosition.x + (dimensions.x / 2),
                y: absolutePosition.y + (dimensions.y / 2),
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

    createConnection = (source, type) => {
        const {gmeClient, activeNode, contextNode} = this.props;

        gmeClient.startTransaction('creating a connection');
        const connectionId = gmeClient.createNode({
            baseId: type,
            parentId: contextNode,
        });
        gmeClient.setPointer(connectionId, 'src', source);
        gmeClient.setPointer(connectionId, 'dst', activeNode);
        gmeClient.completeTransaction('connection created');
    };

    render() {
        const {
            hidden, position, dimensions, validTypes, connectionManager,
        } = this.props;
        const {freeze, mouseOver} = this.state;
        let background;

        if (freeze) {
            background = 'lightblue';
        } else {
            if (hidden) {
                return null;
            }

            if (connectionManager.isConnecting) {
                // It's connecting - is it a valid destination?
                if (validTypes.dst !== connectionManager.type) {
                    return null;
                }

                background = 'lightgreen';
            } else if (validTypes.src === undefined) {
                // It's NOT connecting - is it a valid source?
                return null;
            } else if (mouseOver) {
                background = 'lightgreen';
            }
        }

        const left = mouseOver ? `${position ? position.x - 5 : 0}px` : `${position ? position.x : 0}px`;
        const top = mouseOver ? `${position ? position.y - 5 : 0}px` : `${position ? position.y : 0}px`;
        const width = mouseOver ? `${dimensions ? dimensions.x + 8 : 13}px` : `${dimensions ? dimensions.x : 5}px`;
        const height = mouseOver ? `${dimensions ? dimensions.y + 8 : 13}px` : `${dimensions ? dimensions.y : 5}px`;
        const border = mouseOver ? '2px solid #000000' : '1px solid #000000';

        return (
            <div
                role="presentation"
                style={{
                    position: 'absolute',
                    backgroundColor: background,
                    opacity: 0.5,
                    left,
                    top,
                    width,
                    height,
                    border: background ? border : null,
                    zIndex: ZLEVELS.port,
                }}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave}
                onClick={this.onClick}
            />);
    }
}
