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
import {withStyles} from 'material-ui/styles';
import green from 'material-ui/colors/green';

import {toggleLeftDrawer} from '../actions';

import PartBrowser from './PartBrowser';
import ResultList from './ResultList';
import PluginConfigDialog from '../Dialogs/PluginConfigDialog';
import DomainSelector from '../Dialogs/DomainSelector';

import ConsoleDialog from '../ConsoleDialog';
import OTConsoleTest from '../OTConsoleTest';
import {sideDrawer as styles} from '../classes';

const mapStateToProps = state => {
    return {
        open: state.leftDrawer,
        modelingView: state.modelingView
    }
};

const mapDispatchToProps = dispatch => {
    return {
        hide: () => {
            dispatch(toggleLeftDrawer(false));
        },
        show: () => {
            dispatch(toggleLeftDrawer(true));
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
        showCheckDialog: false,
        simulateConsole: false,
        showDomainSelector: false
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

    render() {
        const {classes, gmeClient, open, modelingView} = this.props;
        let actionButtons;

        if (modelingView) {
            actionButtons = [
                {
                    id: 'showCheckDialog',
                    iconClass: <CheckCircle style={{color: green[500]}} />
                },
                {
                    id: 'simulateConsole',
                    iconClass: <PlayCircleOutline color='primary'/>
                },
                {
                    id: 'showDomainSelector',
                    iconClass: <AddCircle color='secondary'/>
                }];
        } else {
            actionButtons = []; // TODO: Fill up the actions for simulation.
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
                    {actionButtons.map(desc => (
                        <IconButton key={desc.id} onClick={() => {
                            this.setState({[desc.id]: true});
                        }}>
                            {desc.iconClass}
                        </IconButton>
                    ))}
                </span>
                    <Divider/>
                    {modelingView ? <PartBrowser gmeClient={gmeClient} minimized={!open}/> :
                        <ResultList gmeClient={gmeClient} minimized={!open}/>}


                </Drawer>
                {this.state.showCheckDialog ? (<PluginConfigDialog onReady={(config) => {
                    console.log('config set:', config);
                    this.setState({showCheckDialog: false});
                }}
                                                                  onCancel={() => {
                                                                      console.log('canceled');
                                                                      this.setState({showCheckDialog: false});
                                                                  }}/>) : null}
                {this.state.simulateConsole ? (<ConsoleDialog onReady={(config) => {
                    this.setState({simulateConsole: false});
                }}/>) : null}
                {this.state.simulateOT ? (<OTConsoleTest
                    onReady={(config) => {
                        this.setState({simulateOT: false});
                    }}
                    gmeClient={gmeClient}
                    nodeId={'/Z/Z'}
                    attributeName={'name'}/>) : null}
                {this.state.showDomainSelector ?
                    <DomainSelector domains={(gmeClient.getProjectInfo().info.kind || '').split(':').slice(1)}
                                    showDomainSelection={true}
                                    title={'Update Domains'}
                                    onOK={this.onUpdateDomains}
                                    onCancel={this.onUpdateDomains}/> : null}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LeftDrawer));