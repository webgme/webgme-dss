import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {ZLEVELS} from '../utils/zLevels';

export default class BasicConnectingComponent extends Component {
    static propTypes = {
        connectionManager: PropTypes.object.isRequired
    };

    state = {
        startPos: null,
        currentPos: null,
        isConnecting: false
    };

    constructor(props) {
        super(props);

        const {connectionManager} = this.props;

        connectionManager.setListener(this.onChange);
    }

    onChange = (event) => {
        this.setState(event);
    };

    render() {
        const {isConnecting, startPos, currentPos} = this.state;
        let top, left, width, height;

        if (isConnecting) {
            top = Math.min(startPos.y, currentPos.y);
            left = Math.min(startPos.x, currentPos.x);
            height = Math.abs(currentPos.y - startPos.y) + 5;
            width = Math.abs(currentPos.x - startPos.x) + 5;
            if (height > 0 && width > 0) {
                return (
                    <svg
                        width={width}
                        height={height}
                        viewBox={0 + ' ' + 0 + ' ' + (width) + ' ' + (height)}
                        style={{
                            position: 'absolute',
                            top: (top - 5) + 'px',
                            left: (left - 5) + 'px',
                            zIndex: ZLEVELS.connection
                        }}
                    >
                        <line
                            strokeWidth={'2'}
                            stroke={'black'}
                            strokeDasharray={'5 5'}
                            x1={startPos.x - (left - 5)}
                            y1={startPos.y - (top - 5)}
                            x2={currentPos.x - (left - 5)}
                            y2={currentPos.y - (top - 5)}/>
                    </svg>
                );
            }
        }
        return null;
    }

}