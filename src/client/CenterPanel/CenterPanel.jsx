import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Canvas from './Canvas';
import Plotter from './Plotter';

const mapStateToProps = state => {
    return {
        modelingView: state.modelingView,
        activeNode: state.activeNode
    }
};

const mapDispatchToProps = dispatch => {
    return {}
};

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
        const {gmeClient, modelingView} = this.props;
        const {scrollPos} = this.state;

        return (
            <div onScroll={this.onScroll}
                 style={{
                     top: 64,
                     left: 64,
                     width: '100%',
                     height: '100vh',
                     position: 'absolute',
                     overflow: 'auto'
                 }}>
                {modelingView ?
                    <Canvas gmeClient={gmeClient} scrollPos={scrollPos}/> : <Plotter/>
                }
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CenterPanel);