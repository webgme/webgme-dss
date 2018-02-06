import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import superagent from 'superagent';
import classNames from 'classnames';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import PlayCircleOutline from 'material-ui-icons/PlayCircleOutline';
import CheckCircle from 'material-ui-icons/CheckCircle';
import AddCircle from 'material-ui-icons/AddCircle';
import Timeline from 'material-ui-icons/Timeline';
import History from 'material-ui-icons/History';
import {withStyles} from 'material-ui/styles';
import green from 'material-ui/colors/green';

import CodeGeneratorMetadata from '../../plugins/ModelicaCodeGenerator/metadata';
import SystemSimulatorMetadata from '../../plugins/SystemSimulator/metadata';
import ModelCheckMetadata from '../../plugins/ModelCheck/metadata';
import getMetaNodeByName from '../gme/utils/getMetaNodeByName';

import {removePlotVariable, toggleLeftDrawer, toggleModelingView} from '../actions';
import {downloadBlobArtifact} from '../gme/utils/saveUrlToDisk';

import PartBrowser from './PartBrowser';
import ResultList from './ResultList';
import PluginConfigDialog from '../Dialogs/PluginConfigDialog';
import DomainSelector from '../Dialogs/DomainSelector';
import NotifyDialog from '../Dialogs/NotifyDialog';
import PluginResultDialog from '../Dialogs/PluginResultDialog';
import ProjectHistory from '../Dialogs/ProjectHistory';
import colorHash from '../gme/utils/colorHash';
import {sideDrawer as styles} from '../classes';

const RUN_SIM = false; // Set to true in order to run simulation

const mapStateToProps = state => {
    return {
        open: state.leftDrawer,
        activeNode: state.activeNode,
        modelingView: state.modelingView,
        variables: state.plotData.variables
    }
};

const mapDispatchToProps = dispatch => {
    return {
        hide: () => {
            dispatch(toggleLeftDrawer(false));
        },
        show: () => {
            dispatch(toggleLeftDrawer(true));
        },
        removePlotVariable: varName => {
            dispatch(removePlotVariable(varName));
        },
        toggleModelingView: modelView => {
            dispatch(toggleModelingView(modelView));
        }
    }
};

class LeftDrawer extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,

        open: PropTypes.bool.isRequired,

        classes: PropTypes.object.isRequired
    };

    state = {
        showCodeGenerator: false,
        showChecker: false,
        showDomainSelector: false,
        showHistory: false,
        checkResult: null,
    };

    onUpdateDomains = (data) => {
        this.setState({showDomainSelector: false});
        if (!data) {
            // Cancelled
            return;
        }

        console.log('update data:', data);

        let path = [
            window.location.origin,
            this.props.gmeClient.gmeConfig.rest.components.DomainManager.mount,
            'updateProject'
        ].join('/');

        const {gmeClient} = this.props;

        superagent.post(path)
            .send({
                projectId: gmeClient.getActiveProjectId(),
                domains: data.domains
            })
            .end((err, result) => {
                if (err) {
                    // TODO: we need to show these errors
                    console.error(err);
                } else {
                    console.log(result.body);
                    // const [owner, name] = result.body.projectId.split('+');
                    // this.props.history.push(`/p/${owner}/${name}`);
                }
            });
    };

    runCodeGenerator = (config) => {
        const {gmeClient, activeNode} = this.props;

        this.setState({showCodeGenerator: false});
        if (!config) {
            // Cancelled
            return;
        }

        if (RUN_SIM === false) {
            const pluginId = CodeGeneratorMetadata.id;
            let context = gmeClient.getCurrentPluginContext(pluginId, activeNode);

            gmeClient.runServerPlugin(pluginId, context, function (err, result) {
                if (err) {
                    console.error(err);
                } else {
                    if (result.success) {
                        downloadBlobArtifact(result.artifacts[0]);
                    } else {
                        console.error(result);
                    }
                }
            });
        } else {
            const pluginId = SystemSimulatorMetadata.id;
            const simResContainer = getMetaNodeByName(gmeClient, 'SimulationResults');
            const simResMeta = getMetaNodeByName(gmeClient, 'SimulationResult');

            if (!simResContainer || !simResMeta) {
                console.error(new Error('Could not find SimulationResults or SimulationResult in meta...'));
                return;
            }

            gmeClient.startTransaction();

            // Create a Simulation Result..
            const resId = gmeClient.createNode({
                parentId: simResContainer.getId(),
                baseId: simResMeta.getId()
            }, {
                attributes: {
                    name: 'Result_' + Date.now() //TODO: This should be a better Name
                }
            });

            // .. copy over the canvas model
            const modelId = gmeClient.copyNode(activeNode, resId);
            const uiId = gmeClient.addUI(null, () => {
            });
            gmeClient.updateTerritory(uiId, {[modelId]: {children: 0}});
            gmeClient.completeTransaction('Created simulation results', err => {
                if (err) {
                    console.error(err);
                    return;
                }

                let context = gmeClient.getCurrentPluginContext(pluginId, modelId);
                gmeClient.removeUI(uiId);

                this.props.toggleModelingView(false);
                gmeClient.runServerPlugin(pluginId, context, (err, result) => {
                    if (err) {
                        console.error(err);
                    } else {
                        if (result.success) {
                            downloadBlobArtifact(result.artifacts[0]);
                        } else {
                            console.error(result);
                        }
                    }
                });
            });
        }
    };

    runModelCheck = (config) => {
        const {gmeClient, activeNode} = this.props,
            self = this;

        self.setState({showChecker: false});

        if (!config) {
            // Cancelled
            return;
        }

        const pluginId = ModelCheckMetadata.id;
        let context = gmeClient.getCurrentPluginContext(pluginId, activeNode);
        // TODO: Remove when engine is bumped
        context.managerConfig.activeNode = activeNode;

        gmeClient.runServerPlugin(pluginId, context, function (err, result) {
            if (err) {
                console.error(err);
            } else {
                console.log('model check finished');
                self.setState({checkResult: result});
            }
        });
    };

    getCheckResultContent = () => {
        const {checkResult} = this.state;

        if (checkResult.success === true) {
            return (<NotifyDialog
                title={'Model check success'}
                text={'The model has no issues and can be simulated as such.'}
                onOK={
                    () => {
                        this.setState({checkResult: null});
                    }}/>);
        } else {
            return (<PluginResultDialog onOK={
                () => {
                    this.setState({checkResult: null});
                }
            } result={checkResult}
                                        title={'Model check findings'}/>);
        }
    };

    render() {
        const {classes, gmeClient, open, modelingView, variables} = this.props;
        let actionButtons;

        if (modelingView) {
            actionButtons = [
                {
                    id: 'showChecker',
                    iconClass: <CheckCircle style={{color: green[500]}}/>
                },
                {
                    id: 'showCodeGenerator',
                    iconClass: <PlayCircleOutline color='primary'/>
                },
                {
                    id: 'showDomainSelector',
                    iconClass: <AddCircle color='secondary'/>
                },
                {
                    id: 'showHistory',
                    iconClass: <History color='primary'/>
                }
            ];
        } else {
            actionButtons = variables.map((variable) => {
                return {
                    id: variable,
                    iconClass: <Timeline style={{color: colorHash(variable).rgb}}/>,
                    color: colorHash(variable).rgb
                }
            });
        }

        return (
            <div>
                <Drawer type="permanent"
                        anchor="left"
                        open={open}
                        classes={{paper: classNames(classes.drawerPaper, !open && classes.drawerPaperClose)}}>
                <span>
                <IconButton onClick={open ? this.props.hide : this.props.show}>
                    {open ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
                </IconButton>
                    {modelingView ?
                        actionButtons.map(desc => (
                            <IconButton key={desc.id} onClick={() => {
                                this.setState({[desc.id]: true});
                            }}>
                                {desc.iconClass}
                            </IconButton>
                        )) :
                        open ? [] : actionButtons.map(desc => (
                            <IconButton key={desc.id} onClick={() => {
                                this.props.removePlotVariable(desc.id);
                            }}>
                                {desc.iconClass}
                            </IconButton>
                        ))
                    }
                </span>
                    <Divider/>
                    {modelingView ? <PartBrowser gmeClient={gmeClient} minimized={!open}/> :
                        <ResultList gmeClient={gmeClient} minimized={!open}/>}
                </Drawer>

                {this.state.showCodeGenerator ?
                    <PluginConfigDialog metadata={RUN_SIM ? SystemSimulatorMetadata : CodeGeneratorMetadata}
                                        onOK={this.runCodeGenerator}/> : null}

                {this.state.showChecker ?
                    <PluginConfigDialog metadata={ModelCheckMetadata}
                                        onOK={this.runModelCheck}
                                        fastForward={true}/> : null}

                {this.state.showDomainSelector ?
                    <DomainSelector domains={(gmeClient.getProjectInfo().info.kind || '').split(':').slice(1)}
                                    showDomainSelection={true}
                                    title={'Update Domains'}
                                    onOK={this.onUpdateDomains}
                                    onCancel={this.onUpdateDomains}/> : null}
                {this.state.checkResult ? this.getCheckResultContent() : null}
                {this.state.showHistory ? <ProjectHistory gmeClient={gmeClient} onOK={() => {
                    this.setState({showHistory: false});
                }}/> : null}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LeftDrawer));