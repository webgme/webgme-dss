import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import update from 'immutability-helper';

import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import ErrorIcon from 'material-ui-icons/Error';
import CheckIcon from 'material-ui-icons/Check';
import ExpansionPanel, {ExpansionPanelDetails, ExpansionPanelSummary} from 'material-ui/ExpansionPanel';
import Typography from 'material-ui/Typography';
import {LinearProgress, CircularProgress} from 'material-ui/Progress';

import PlotVariableSelector from './PlotVariableSelector';

import Territory from '../../gme/BaseComponents/Territory';
import getMetaNodeByName from '../../gme/utils/getMetaNodeByName';
import {setPlotNode, setSimResData, setResultNode} from '../../actions';

const mapStateToProps = state => ({
    plotNode: state.plotData.nodeId,
    resultNode: state.resultNode,
    simRes: state.plotData.simRes,
});

const mapDispatchToProps = dispatch => ({
    setPlotNode: (nodeId) => {
        dispatch(setPlotNode(nodeId));
    },
    setSimResData: (simRes) => {
        dispatch(setSimResData(simRes));
    },
    setResultNode: (resultNode) => {
        dispatch(setResultNode(resultNode));
    },
});

class ResultList extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        minimized: PropTypes.bool.isRequired,

        setPlotNode: PropTypes.func.isRequired,
        setSimResData: PropTypes.func.isRequired,
        setResultNode: PropTypes.func.isRequired,
        resultNode: PropTypes.string,
        plotNode: PropTypes.string,
        simRes: PropTypes.object,
    };

    static defaultProps = {
        plotNode: null,
        resultNode: null,
        simRes: null,
    };

    constructor(props) {
        super(props);
        const {gmeClient} = this.props;
        const simResNode = getMetaNodeByName(gmeClient, 'SimulationResults');

        if (simResNode) {
            this.state.containerId = simResNode.getId();
            this.state.territory = {
                [this.state.containerId]: {children: 1},
            };
        } else {
            console.error(new Error('Could not find SimulationResults in meta...'));
        }
    }

    state = {
        containerId: null,
        expandedResId: null,
        territory: null,
        results: {},
    };

    switchPlotNode = (resId) => {
        const {results} = this.state;

        if (resId === null || results[resId].isRunning) {
            // TODO: isRunning check only need for mock
            this.props.setPlotNode(null);
            this.props.setSimResData(null);
        } else {
            this.props.setPlotNode(results[resId].modelId);
            this.props.setSimResData(results[resId].simRes ? JSON.parse(results[resId].simRes) : null);
        }
    };

    handleEvents = (hash, loads, updates, unloads) => {
        const {gmeClient, resultNode} = this.props;
        const {containerId} = this.state;
        const updateDesc = {};

        loads.forEach((nodeId) => {
            if (nodeId !== containerId) {
                const nodeObj = gmeClient.getNode(nodeId);
                const modelId = nodeObj.getChildrenIds()[0]; // FIXME: This is assuming one and only one model
                const isRunning = !nodeObj.getAttribute('stdout');
                updateDesc[nodeId] = {
                    $set: {
                        name: nodeObj.getAttribute('name'),
                        isRunning,
                        modelId,
                        simRes: nodeObj.getAttribute('simRes'),
                    },
                };

                if (nodeId === resultNode && isRunning === false) {
                    //FIXME
                    setTimeout(() => this.switchPlotNode(nodeId));
                }
            }
        });

        updates.forEach((nodeId) => {
            if (nodeId !== containerId) {
                const nodeObj = gmeClient.getNode(nodeId);
                const modelId = nodeObj.getChildrenIds()[0]; // FIXME: This is assuming one and only one model
                const isRunning = !nodeObj.getAttribute('stdout');

                updateDesc[nodeId] = {
                    name: {$set: nodeObj.getAttribute('name')},
                    isRunning: {$set: isRunning},
                    modelId: {$set: modelId},
                    simRes: {$set: nodeObj.getAttribute('simRes')},
                };

                if (nodeId === resultNode && isRunning === false) {
                    //FIXME
                    setTimeout(() => this.switchPlotNode(nodeId));
                }
            }
        });

        updateDesc.$unset = unloads.filter(nodeId => nodeId !== containerId);

        if (unloads.includes(resultNode)) {
            setResultNode(null);
            this.switchPlotNode(null);
        }

        this.setState({
            results: update(this.state.results, updateDesc),
        });
    };

    handleExpand = resId => (event, expanded) => {
        // extract attribute simRes and add it to the state

        if (expanded) {
            this.props.setResultNode(resId);
            this.setState({expandedResId: resId});
            this.switchPlotNode(resId);
        } else {
            this.setState({expandedResId: null});
        }
    };

    render() {
        const {
            minimized, gmeClient, simRes,
        } = this.props;
        const {territory, results, expandedResId} = this.state;

        return (
            <div style={{display: minimized ? 'none' : undefined}}>
                <Territory
                    gmeClient={gmeClient}
                    territory={territory}
                    onUpdate={this.handleEvents}
                    onlyActualEvents
                />

                {Object.keys(results).map((resId) => {
                    const resInfo = results[resId];
                    const hasResults = simRes !== null;
                    const isExpanded = resId === expandedResId;
                    const failed = resInfo.isRunning === false && !resInfo.simRes;

                    let statusIcon = resInfo.isRunning ?
                        <CircularProgress size={24}/> :
                        <CheckIcon style={{color: 'lightgreen'}}/>;

                    if (failed) {
                        statusIcon = <ErrorIcon style={{color: 'lightred'}}/>;
                    }

                    return (
                        <ExpansionPanel
                            key={resId}
                            expanded={isExpanded}
                            onChange={this.handleExpand(resId)}
                        >
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                                <div style={{marginRight: 6, marginLeft: -18}}>
                                    {statusIcon}
                                </div>
                                <Typography
                                    type="subheading"
                                    style={{
                                        textOverflow: 'ellipsis',
                                        maxWidth: 160,
                                        overflow: 'hidden',
                                    }}
                                >{resInfo.name}
                                </Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails style={{display: 'block', padding: 0, paddingBottom: 10}}>
                                {(() => {
                                    if (hasResults) {
                                        return <PlotVariableSelector gmeClient={gmeClient} nodeId={resId}/>;
                                    } else if (failed) {
                                        return <div>simulation failed</div>;
                                    }
                                    return (
                                        <div>
                                            <LinearProgress/>
                                            <br/>
                                            <LinearProgress color="secondary"/>
                                        </div>);
                                })()}
                            </ExpansionPanelDetails>
                        </ExpansionPanel>);
                })}
            </div>);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultList);
