import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Canvas from './Canvas';
import Plotter from './Plotter';
import SelectorCanvas from './SelectorCanvas';
import {centerPanel as style} from '../styles';

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
                 style={style}>
                {modelingView ?
                    <Canvas gmeClient={gmeClient} scrollPos={scrollPos}/> :
                    <div style={{
                        postion: 'fixed',
                        top: 65,
                        left: 50
                    }}>
                        <Plotter/>
                        <SelectorCanvas gmeClient={gmeClient} scrollPos={scrollPos}/>
                    </div>
                }
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CenterPanel);