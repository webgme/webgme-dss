import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import update from 'immutability-helper';

import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import ExpansionPanel, {ExpansionPanelDetails, ExpansionPanelSummary} from 'material-ui/ExpansionPanel';
import Typography from 'material-ui/Typography';

import SimulationResultSelector from './SimulationResultSelector';
import Territory from '../gme/BaseComponents/Territory';
import {setPlotNode} from "../actions";

const mapStateToProps = state => {
    return {
        plotModel: state.plotData.nodeId
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setPlotNode: nodeId => {
            dispatch(setPlotNode(nodeId));
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
        results: {}
    };

    constructor(props) {
        super(props);
        const {gmeClient} = this.props;
        const metaNodes = gmeClient.getAllMetaNodes();
        for (let i = 0; i < metaNodes.length; i += 1) {
            if (metaNodes[i].getAttribute('name') === 'SimulationResults') {
                this.state.containerId = metaNodes[i].getId();
                this.state.territory = {
                    [this.state.containerId]: {children: 1}
                };
                break;
            }
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
                    modelId: nodeObj.getChildrenIds()[0],
                    simRes: nodeObj.getAttribute('simRes')
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
        this.props.setPlotNode(this.state.results[resId].modelId);
    };

    render() {
        const {minimized, gmeClient, plotModel} = this.props;
        const {territory, results} = this.state;
        return (
            <div style={{display: minimized ? 'none': undefined}}>
                <Territory gmeClient={this.props.gmeClient} territory={territory}
                           onUpdate={this.handleEvents} onlyActualEvents={true}/>

                {Object.keys(results).map(resId => {
                        const resInfo = results[resId];
                        const isExpanded = resInfo.modelId === plotModel;

                        return (
                            <ExpansionPanel key={resId}
                                            expanded={isExpanded}
                                            onChange={this.handleExpand(resId)}>
                                <ExpansionPanelSummary expandIcon={resInfo.isRunning ? null : <ExpandMoreIcon/>}>
                                    <Typography type='subheading'>{resInfo.name}</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails style={{display: 'block', padding: 0, paddingBottom: 10}}>
                                    {isExpanded ? <SimulationResultSelector gmeClient={gmeClient} nodeId={resId}/>: <div/>}
                                </ExpansionPanelDetails>
                            </ExpansionPanel>);
                    }
                )}
            </div>);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultList);