import React, {Component} from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import ExpansionPanel, {ExpansionPanelDetails, ExpansionPanelSummary} from 'material-ui/ExpansionPanel';
import Typography from 'material-ui/Typography';

import Territory from '../gme/BaseComponents/Territory';

export default class ResultList extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        minimized: PropTypes.bool.isRequired,
    };

    state = {
        containerId: null,
        territory: null,
        expandedResult: null,
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
                        isRunning: !nodeObj.getAttribute('stdout')
                    }
                };
            }
        });

        updates.forEach(nodeId => {
            if (nodeId !== containerId) {
                let nodeObj = gmeClient.getNode(nodeId);
                updateDesc[nodeId] = {
                    name: {$set: nodeObj.getAttribute('name')},
                    isRunning: {$set: !nodeObj.getAttribute('stdout')}
                };
            }
        });

        updateDesc.$unset = unloads.filter(nodeId => nodeId !== containerId);

        this.setState({
            results: update(this.state.results, updateDesc)
        })
    };

    handleExpand = resId => (event, expanded) => {
        this.setState({ expandedResult: expanded ? resId : null });
    };

    render() {
        const {minimized} = this.props;
        const {territory, results, expandedResult} = this.state;
        return (
            <div style={{display: minimized ? 'none': undefined}}>
                <Territory gmeClient={this.props.gmeClient} territory={territory}
                           onUpdate={this.handleEvents} onlyActualEvents={true}/>

                {Object.keys(results).map(resId => {
                        const resInfo = results[resId];
                        const isExpanded = resId === expandedResult;

                        return (
                            <ExpansionPanel key={resId}
                                            expanded={isExpanded}
                                            onChange={this.handleExpand(resId)}>
                                <ExpansionPanelSummary expandIcon={resInfo.isRunning ? null : <ExpandMoreIcon/>}>
                                    <Typography type='subheading'>{resInfo.name}</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails style={{display: 'block', padding: 0, paddingBottom: 10}}>
                                    {isExpanded ? 'Here the tree view with results will be constructed': null}
                                </ExpansionPanelDetails>
                            </ExpansionPanel>);
                    }
                )}
            </div>);
    }
}