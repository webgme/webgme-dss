import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Grid from '@material-ui/core/Grid';

import Canvas from '../containers/CenterPanel/Canvas/Canvas';
import CanvasItem from './Canvas/CanvasItem';
import PlotManager from './PlotManager';
import SelectorCanvas from './SelectorCanvas';
import OTConsole from '../OTConsole';
import ResultsInfoCard from './ResultsInfoCard';
import {centerPanel as getStyle} from '../styles';


const mapStateToProps = state => ({
    modelingView: state.modelingView,
    activeNode: state.activeNode,
    resultNode: state.resultNode,
    plotData: state.plotData,
    leftDrawer: state.leftDrawer,
});

const mapDispatchToProps = (/* dispatch */) => ({});

class CenterPanel extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        modelingView: PropTypes.bool.isRequired,
        plotData: PropTypes.object.isRequired,
        resultNode: PropTypes.string,
        leftDrawer: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        resultNode: null,
    };

    state = {
        scrollPos: {
            x: 0,
            y: 0,
        },
    };

    onScroll = (event) => {
        this.setState({
            scrollPos: {
                x: event.target.scrollLeft,
                y: event.target.scrollTop,
            },
        });
    };

    render() {
        const {
            gmeClient,
            modelingView,
            plotData,
            resultNode,
            leftDrawer,
        } = this.props;

        const {scrollPos} = this.state;
        let content;

        if (modelingView) {
            content = (
                <Canvas gmeClient={gmeClient} scrollPos={scrollPos}>
                    <CanvasItem/>
                </Canvas>
            );
        } else if (plotData.simRes) {
            content = (
                <div style={{
                    height: '100%',
                    width: '100%',
                }}
                >
                    <PlotManager variables={plotData.variables} simRes={plotData.simRes}/>
                    <div style={{
                        width: '100%',
                        height: 'calc(100% - 270px)',
                        position: 'absolute',
                    }}
                    ><SelectorCanvas gmeClient={gmeClient} scrollPos={scrollPos}/>
                    </div>
                </div>);
        } else if (resultNode) {
            content = (
                <Grid container spacing={0} style={{height: '100%'}}>
                    <Grid
                        item
                        xs={6}
                        style={{
                            position: 'relative',
                            overflow: 'auto',
                        }}
                    >
                        <SelectorCanvas gmeClient={gmeClient} scrollPos={scrollPos}/>
                    </Grid>
                    <Grid
                        item
                        xs={6}
                    >
                        <OTConsole gmeClient={gmeClient} nodeId={resultNode} attributeName="stdout"/>
                    </Grid>
                </Grid>);
        } else {
            content = ResultsInfoCard();
        }

        return (
            <div onScroll={this.onScroll} style={getStyle(leftDrawer)}>
                {content}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CenterPanel);
