import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class BasicConnectingComponent extends Component {
    static propTypes = {
        connectionManager: PropTypes.object.isRequired,
        offset: PropTypes.object
    };

    state = {
        startPos: null,
        currentPos: null,
        isConnecting: false,
        realOffset: null
    };

    constructor(props) {
        super(props);
        this.props.connectionManager.setListener(this.onChange);
    }

    onChange = (event) => {
        this.setState(event);
    };

    render() {
        let {isConnecting, startPos, currentPos} = this.state,
            {offset} = this.props,
            top, left, width, height;

        if (isConnecting && offset) {
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
                            zIndex: 9
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
            /*return <div style={{
                position: 'absolute',
                top: top + 'px',
                left: left + 'px',
                border: '1px solid #000000',
                width: width,
                height: height,
                zIndex: 999999
            }}/>*/
        }
        return null;
    }

}