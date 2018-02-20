import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import Paper from 'material-ui/Paper';

import Canvas from './Canvas';
import Plotter from './Plotter';
import SelectorCanvas from './SelectorCanvas';
import OTConsole from '../OTConsole';
import {centerPanel as style} from '../styles';

const mapStateToProps = state => ({
    modelingView: state.modelingView,
    activeNode: state.activeNode,
    resultNode: state.resultNode,
    plotData: state.plotData,
});

const mapDispatchToProps = (/* dispatch */) => ({});

class CenterPanel extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        modelingView: PropTypes.bool.isRequired,
        plotData: PropTypes.object.isRequired,
        resultNode: PropTypes.string,
    };

    static defaultProps = {
        resultNode: null,
    };

    state = {
        scrollPos: {x: 0, y: 0},
    };

    onScroll = (event) => {
        this.setState({scrollPos: {x: event.target.scrollLeft, y: event.target.scrollTop}});
    };

    render() {
        const {
            gmeClient, modelingView, plotData, resultNode,
        } = this.props;

        const {scrollPos} = this.state;

        const flexStyle = JSON.parse(JSON.stringify(style));

        if (!modelingView) {
            flexStyle.backgroundColor = 'rgb(192, 192, 192)';
        }

        let content;

        if (modelingView) {
            content = (<Canvas gmeClient={gmeClient} scrollPos={scrollPos}/>);
        } else {
            content = (
                <div style={{
                    position: 'fixed',
                    left: 50,
                    top: 50,
                    width: '100%',
                    height: '100%',
                }}
                >
                    <Paper
                        elevation={0}
                        style={{
                            overflow: 'auto',
                            width: '100%',
                        }}
                    >
                        {plotData.nodeId ?
                            <Plotter variables={plotData.variables} simRes={plotData.simRes}/> :
                            <OTConsole gmeClient={gmeClient} resultNode={resultNode} attributeName="stdout"/>}
                    </Paper>
                    <Paper
                        elevation={0}
                        style={{
                            top: 351,
                            left: 50,
                            bottom: 0,
                            right: 0,
                            overflow: 'auto',
                            position: 'inherit',
                        }}
                    >
                        <SelectorCanvas gmeClient={gmeClient} scrollPos={scrollPos}/>
                    </Paper>
                </div>);
        }

        return (
            <div onScroll={this.onScroll} style={flexStyle}>
                {content}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CenterPanel);
