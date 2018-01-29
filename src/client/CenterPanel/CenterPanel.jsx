import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Canvas from './Canvas';

class CenterPanel extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired
    };

    state = {
        scrollPos: {x: 0, y: 0}
    };

    onScroll = (event) => {
        this.setState({scrollPos: {x: event.target.scrollLeft, y: event.target.scrollTop}});
    };

    render() {
        const {gmeClient} = this.props;
        const {scrollPos} = this.state;

        return (
            <div onScroll={this.onScroll}
                 style={{
                     top: 0,
                     left: 0,
                     width: '100%',
                     height: '100vh',
                     position: 'absolute',
                     overflow: 'auto'
                 }}>
                <Canvas gmeClient={gmeClient} scrollPos={scrollPos}/>
            </div>
        );
    }
}

export default CenterPanel;