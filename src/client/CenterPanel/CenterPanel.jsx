import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';

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
        const {gmeClient, modelingView} = this.props,
            {scrollPos} = this.state;
        let flexStyle = JSON.parse(JSON.stringify(style));

        if (!modelingView)
            flexStyle.backgroundColor = 'rgb(192, 192, 192)';
        return (
            <div onScroll={this.onScroll}
                 style={flexStyle}>
                {modelingView ?
                    <Canvas gmeClient={gmeClient} scrollPos={scrollPos}/> :
                    <div style={{
                        position: 'fixed',
                        left: 60,
                        top: 60,
                        width: '100%',
                        height: '100%'
                    }}>

                        <Paper elevation={10} style={{
                            overflow: 'auto',
                            width: '95%'
                        }}>
                            <Plotter/>
                        </Paper>
                        <Paper elevation={10} style={{
                            top: 370,
                            left: 60,
                            width: '95%',
                            height: 'calc(100% - 400px)',
                            overflow: 'auto',
                            position: 'inherit'
                        }}>
                            <SelectorCanvas gmeClient={gmeClient} scrollPos={scrollPos}/>
                        </Paper>
                    </div>
                }
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CenterPanel);