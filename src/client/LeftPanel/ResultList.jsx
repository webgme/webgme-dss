import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import update from 'immutability-helper';

import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import ExpansionPanel, {ExpansionPanelDetails, ExpansionPanelSummary} from 'material-ui/ExpansionPanel';
import Typography from 'material-ui/Typography';
import { CircularProgress } from 'material-ui/Progress';

import SimulationResultSelector from './SimulationResultSelector';
import Territory from '../gme/BaseComponents/Territory';
import getMetaNodeByName from '../gme/utils/getMetaNodeByName';
import {setPlotNode, setSimResData} from "../actions";

const mapStateToProps = state => {
    return {
        plotModel: state.plotData.nodeId
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setPlotNode: nodeId => {
            dispatch(setPlotNode(nodeId));
        },
        setSimResData: simRes => {
            dispatch(setSimResData(simRes));
        }
    }
};

class ResultList extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        minimized: PropTypes.bool.isRequired,
    };

    state = {
        containerId: null,
        territory: null,
        expandedResId: null,
        results: {}
    };

    constructor(props) {
        super(props);
        const {gmeClient} = this.props;
        const simResNode = getMetaNodeByName(gmeClient, 'SimulationResults');

        if (simResNode) {
            this.state.containerId = simResNode.getId();
            this.state.territory = {
                [this.state.containerId]: {children: 1}
            };
        } else {
            console.error(new Error('Could not find SimulationResults in meta...'));
        }
    }

    handleEvents = (hash, loads, updates, unloads) => {
        const {gmeClient} = this.props;
        const {containerId} = this.state;
        let updateDesc = {};

        loads.forEach(nodeId => {
            if (nodeId !== containerId) {
                let nodeObj = gmeClient.getNode(nodeId);
                updateDesc[nodeId] = {
                    $set: {
                        name: nodeObj.getAttribute('name'),
                        isRunning: !nodeObj.getAttribute('stdout'),
                        modelId: nodeObj.getChildrenIds()[0], // FIXME: This is assuming one and only one model
                        simRes: nodeObj.getAttribute('simRes')
                    }
                };
            }
        });

        updates.forEach(nodeId => {
            if (nodeId !== containerId) {
                let nodeObj = gmeClient.getNode(nodeId);
                updateDesc[nodeId] = {
                    name: {$set: nodeObj.getAttribute('name')},
                    isRunning: {$set: !nodeObj.getAttribute('stdout')},
                    modelId: {$set: nodeObj.getChildrenIds()[0]},
                    simRes: {$set: nodeObj.getAttribute('simRes')}
                };
            }
        });

        updateDesc.$unset = unloads.filter(nodeId => nodeId !== containerId);

        this.setState({
            results: update(this.state.results, updateDesc)
        })
    };

    handleExpand = resId => (event, expanded) => {
        // extract attribute simRes and add it to the state
        const {setPlotNode, setSimResData} = this.props;
        const {results} = this.state;

        if (expanded) {
            if (results[resId].isRunning) {
                setPlotNode(null);
                setSimResData({});
            } else {
                setPlotNode(results[resId].modelId);
                setSimResData(results[resId].simRes ? JSON.parse(results[resId].simRes) : {});
            }
            this.setState({expandedResId: resId})
        } else {
            this.setState({expandedResId: null});
        }
    };

    render() {
        const {minimized, gmeClient, plotModel} = this.props;
        const {territory, results, expandedResId} = this.state;
        return (
            <div style={{display: minimized ? 'none' : undefined}}>
                <Territory gmeClient={this.props.gmeClient} territory={territory}
                           onUpdate={this.handleEvents} onlyActualEvents={true}/>

                {Object.keys(results).map(resId => {
                        const resInfo = results[resId];
                        const isActive = resInfo.modelId === plotModel;
                        const isExpanded = resId === expandedResId;

                        return (
                            <ExpansionPanel key={resId}
                                            expanded={isExpanded}
                                            onChange={this.handleExpand(resId)}>
                                <ExpansionPanelSummary expandIcon={resInfo.isRunning ? <CircularProgress size={30}/>
                                    : <ExpandMoreIcon/>}>
                                    <Typography type='subheading'>{resInfo.name}</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails style={{display: 'block', padding: 0, paddingBottom: 10}}>
                                    {isActive ? <SimulationResultSelector gmeClient={gmeClient} nodeId={resId}/> : <div/>}
                                </ExpansionPanelDetails>
                            </ExpansionPanel>);
                    }
                )}
            </div>);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultList);