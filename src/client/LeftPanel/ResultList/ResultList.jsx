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
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';

import ModeEdit from 'material-ui-icons/ModeEdit';
import FileDownload from 'material-ui-icons/FileDownload';
import Delete from 'material-ui-icons/Delete';
import Description from 'material-ui-icons/Description';
import ChromeReaderMode from 'material-ui-icons/ChromeReaderMode';

import PlotVariableSelector from './PlotVariableSelector';
import RenameInput from './RenameInput';
import ConfirmDialog from '../../Dialogs/ConfirmDialog';


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
        editResultName: false,
        showConfirmDelete: false,
    };

    handleEvents = (hash, loads, updates, unloads) => {
        const {gmeClient, resultNode} = this.props;
        const {containerId} = this.state;
        const updateDesc = {};
        const attrNames = ['name', 'simRes', 'simPackage', 'csvFile', 'timestamp'];

        loads.forEach((nodeId) => {
            if (nodeId !== containerId) {
                const nodeObj = gmeClient.getNode(nodeId);
                const modelId = nodeObj.getChildrenIds()[0]; // FIXME: This is assuming one and only one model
                const isRunning = !nodeObj.getAttribute('stdout');

                updateDesc[nodeId] = {
                    $set: {
                        isRunning,
                        modelId,
                    },
                };

                attrNames.forEach((attrName) => {
                    updateDesc[nodeId].$set[attrName] = nodeObj.getAttribute(attrName);
                });

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
                    isRunning: {$set: isRunning},
                    modelId: {$set: modelId},
                };

                attrNames.forEach((attrName) => {
                    updateDesc[nodeId][attrName] = {$set: nodeObj.getAttribute(attrName)};
                });

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

    updateResultTitle = (resId, canceled, newName) => {
        const {gmeClient} = this.props;
        const {results} = this.state;
        console.log('newName for ', resId, canceled, newName);
        if (results[resId] && canceled === false && results[resId].name !== newName) {
            gmeClient.setAttribute(resId, 'name', newName);
        }

        this.setState({editResultName: false});
    };

    downloadArtifact = (entirePackage) => {
        alert('Would download entirepacke?' + entirePackage);
    };

    onDeleteConfirmed = (doDelete) => {
        const {gmeClient} = this.props;
        const {expandedResId} = this.state;

        if (doDelete && expandedResId) {
            gmeClient.deleteNode(expandedResId, 'Result was removed ' + expandedResId);
        }

        this.setState({showConfirmDelete: false});
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

    render() {
        const {
            minimized, gmeClient, simRes,
        } = this.props;

        const {
            territory, results, expandedResId, editResultName, showConfirmDelete,
        } = this.state;

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

                    const actionButtons = [
                        {
                            id: 'modeEdit',
                            toolTip: 'Rename result',
                            iconClass: <ModeEdit color="primary"/>,
                            onClick: () => {
                                this.setState({editResultName: true});
                            },
                        },
                        {
                            id: 'delete',
                            toolTip: 'Delete result',
                            iconClass: <Delete color="primary"/>,
                            onClick: () => {
                                this.setState({showConfirmDelete: true});
                            },
                        },
                    ];

                    let statusIcon;

                    if (resInfo.isRunning) {
                        statusIcon = <CircularProgress size={24}/>;
                    } else if (failed) {
                        statusIcon = <ErrorIcon style={{color: 'pink'}}/>;
                        actionButtons.push({
                            id: 'viewConsole',
                            toolTip: 'View console output',
                            iconClass: <ChromeReaderMode color="primary"/>,
                            onClick: () => {
                                this.downloadArtifact(false);
                            },
                        });
                    } else {
                        statusIcon = <CheckIcon style={{color: 'lightgreen'}}/>;
                        actionButtons.push({
                            id: 'viewConsole',
                            toolTip: 'View console output',
                            iconClass: <ChromeReaderMode color="primary"/>,
                            onClick: () => {
                                this.showConsole(false);
                            },
                        });

                        actionButtons.push({
                            id: 'downloadCSV',
                            toolTip: 'Download CSV result file',
                            iconClass: <Description color="primary"/>,
                            onClick: () => {
                                this.downloadArtifact(false);
                            },
                        });

                        actionButtons.push({
                            id: 'downloadPackage',
                            toolTip: 'Download simulation package',
                            iconClass: <FileDownload color="primary"/>,
                            onClick: () => {
                                this.downloadArtifact(true);
                            },
                        });
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
                                {editResultName && expandedResId === resId && results[expandedResId] ?
                                    (
                                        <RenameInput
                                            initialValue={results[expandedResId].name}
                                            onDone={(canceled, newValue) => {
                                                this.updateResultTitle(resId, canceled, newValue);
                                            }}
                                        />) :
                                    (
                                        <Typography
                                            type="subheading"
                                            style={{
                                                textOverflow: 'ellipsis',
                                                maxWidth: 160,
                                                overflow: 'hidden',
                                            }}
                                        >{resInfo.name}
                                        </Typography>)
                                }

                            </ExpansionPanelSummary>

                            <ExpansionPanelDetails style={{display: 'block', padding: 0, paddingBottom: 10}}>
                                <span>
                                    {actionButtons.map(desc => (
                                        <Tooltip
                                            key={desc.id}
                                            id={desc.id}
                                            title={desc.toolTip}
                                            placement="top"
                                        >
                                            <IconButton
                                                key={desc.id}
                                                onClick={desc.onClick}
                                            >
                                                {desc.iconClass}
                                            </IconButton>
                                        </Tooltip>
                                    ))}
                                </span>
                                {(() => {
                                    if (hasResults) {
                                        return <PlotVariableSelector gmeClient={gmeClient} nodeId={resId}/>;
                                    } else if (failed) {
                                        return null;
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

                {showConfirmDelete ?
                    <ConfirmDialog
                        title="Delete Result"
                        message="Do you want to delete the result? If the simulation is running it will be aborted.."
                        onClose={this.onDeleteConfirmed}
                    /> :
                    null
                }
            </div>);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResultList);
