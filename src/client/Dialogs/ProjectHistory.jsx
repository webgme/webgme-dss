import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import moment from 'moment';
import Avatar from 'material-ui/Avatar';
import Button from 'material-ui/Button';
import Badge from 'material-ui/Badge';
import Typography from 'material-ui/Typography';
import {connect} from 'react-redux';
import IconButton from 'material-ui/IconButton';
import Visibility from 'material-ui-icons/Visibility';
import PlayArrow from 'material-ui-icons/PlayArrow';
import Grid from 'material-ui/Grid';
import Tooltip from 'material-ui/Tooltip';
import NotifyDialog from './NotifyDialog';
import ListSubheader from 'material-ui/List/ListSubheader';
import List, {ListItem, ListItemIcon, ListItemText} from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';

import ModelicaDiffMetadata from '../../plugins/ModelicaDiff/metadata';

const mapStateToProps = state => {
    return {}
};

const mapDispatchToProps = dispatch => {
    return {}
};

class ProjectHistory extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        onOK: PropTypes.func.isRequired,
        batchSize: PropTypes.number
    };

    static defaultProps = {
        batchSize: 10
    };

    state = {
        commits: [],
        activeCommit: null,
        showDiff: false,
        diff: null
    };

    showDiff = (oldRootHash) => {
        const self = this,
            pluginId = ModelicaDiffMetadata.id,
            {gmeClient} = this.props;
        let context = gmeClient.getCurrentPluginContext(pluginId, '');

        context.pluginConfig = {oldRootHash: oldRootHash};
        console.log(context);

        gmeClient.runServerPlugin(pluginId, context, function (err, result) {
            if (err) {
                console.error(err);
            } else {
                if (result.success) {
                    self.setState({
                        showDiff: true,
                        diff: JSON.parse(result.messages[0].message)
                    });
                } else {
                    console.error(result);
                }
            }
        });
    };

    newHistoryItems = (err, items) => {
        console.log(JSON.stringify(items, null, 2));
        if (!err)
            this.setState({commits: this.state.commits.concat(items)});
    };

    componentDidMount() {
        const {gmeClient, batchSize} = this.props,
            activeCommit = gmeClient.getActiveCommitHash();

        gmeClient.getHistory(gmeClient.getProjectObject().projectId, activeCommit, batchSize, this.newHistoryItems);
        this.setState({activeCommit: activeCommit});
    }

    getDiffDialog = () => {
        const {diff} = this.state;
        let domain, simulation, model;

        if (diff === null || (diff.model === null && diff.domain === null && diff.simulation === null)) {
            return (<NotifyDialog text={'No difference with the current state.'} title={' '} onOK={() => {
                this.setState({showDiff: false});
            }}/>);
        }

        // domain
        if (diff.domain === null) {
            domain = (<ListItem button={false}>
                <ListItemText inset={false} primary={'Domains'} secondary={'no change'}/>
            </ListItem>);
        } else {
            domain = [
                (<ListItem button={true} onClick={() => {
                    this.setState({diff_domain_open: !this.state.diff_domain_open});
                }}>
                    <ListItemText inset={true} primary={'Domain changes'}/>
                    {this.state.diff_domain_open ? <ExpandLess/> : <ExpandMore/>}
                </ListItem>),
                (<Collapse in={this.state.diff_domain_open} timeout="auto">
                    <List dense={true}>
                        {diff.domain.map((item) => {
                            return <ListItem><ListItemText inset={true} primary={item}/></ListItem>;
                        })}
                    </List>
                </Collapse>)
            ];
        }

        // simulation
        if (diff.simulation === null) {
            simulation = (<ListItem button={false}>
                <ListItemText inset={false} primary={'Simulations'} secondary={'no change'}/>
            </ListItem>);
        } else {
            simulation = [
                (<ListItem button={true} onClick={() => {
                    this.setState({diff_simulation_open: !this.state.diff_simulation_open});
                }}>
                    <ListItemText inset={true} primary={'Simulation result changes'}/>
                    {this.state.diff_simulation_open ? <ExpandLess/> : <ExpandMore/>}
                </ListItem>),
                (<Collapse in={this.state.diff_simulation_open} timeout="auto">
                    <List dense={true}>
                        {diff.simulation.map((item) => {
                            return <ListItem><ListItemText inset={true} primary={item}/></ListItem>;
                        })}
                    </List>
                </Collapse>)
            ];
        }

        // model
        if (diff.model === null) {
            model = (<ListItem button={false}>
                <ListItemText inset={false} primary={'Model'} secondary={'no change'}/>
            </ListItem>);
        } else {
            let nodeElements = [],
                nodes = Object.keys(diff.model);
            nodes.forEach((node) => {
                let stateName = 'diff_model_open_' + node;
                nodeElements.push((<ListItem button={true} onClick={() => {
                    let newState = {};
                    newState[stateName] = !this.state[stateName];
                    this.setState(newState);
                }}>
                    <ListItemText inset={true} primary={node}/>
                    {this.state[stateName] ? <ExpandLess/> : <ExpandMore/>}
                </ListItem>));
                nodeElements.push(
                    <Collapse in={this.state[stateName]} timeout="auto">
                        <List dense={true}>
                            {diff.model[node].map((item) => {
                                return <ListItem><ListItemText inset={true} primary={item}/></ListItem>;
                            })}
                        </List>
                    </Collapse>
                );
            });

            model = [(<ListItem button={true} onClick={() => {
                this.setState({diff_model_open: !this.state.diff_model_open});
            }}>
                <ListItemText inset={true} primary={'Model'}/>
                {this.state.diff_model_open ? <ExpandLess/> : <ExpandMore/>}
            </ListItem>),
                (<Collapse in={this.state.diff_model_open} timeout="auto">
                    <List dense={true}>
                        {nodeElements}
                    </List>
                </Collapse>)];
        }
        return (<Dialog open={true}>
            <DialogTitle>Differences</DialogTitle>
            <DialogContent>
                <List dense={true}>
                    {domain}
                    {model}
                    {simulation}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    this.setState({showDiff: false, diff: null});
                }} color='primary'>OK</Button>
            </DialogActions>
        </Dialog>);
    };

    render() {
        const {onOK, gmeClient, batchSize} = this.props,
            {commits, activeCommit, showDiff, diff} = this.state,
            project = gmeClient.getProjectObject(),
            projectId = project.projectId,
            showDiffFn = this.showDiff;
        let items = commits.map(commit => {
            let when = new Date(parseInt(commit.time, 10)),
                current = commit._id === this.state.activeCommit;

            return <Grid key={commit._id} container={true} wrap={'wrap'}
                         style={{
                             border: '2px solid #000000',
                             color: current ? 'red' : 'blue',
                             margin: '2px',
                             marginLeft: '-6px'
                         }}
                         alignItems={'center'}
                         color={current ? 'primary' : 'secondary'}>
                <Grid item={true} xs={4} sm={2} style={{cursor: 'help'}}>
                    <Tooltip id={'time-tooltip'} title={moment(when).local().format('dddd, MMMM Do YYYY, h:mm:ss a')}>
                        <Grid item={true}><Badge content={moment(when).fromNow()}>{commit.updater[0]}</Badge></Grid>
                    </Tooltip>
                </Grid>
                <Grid item={true} xs={12} sm={6}>{commit.message}</Grid>
                <Grid item={true} xs={5} sm={3} zeroMinWidth={true}>
                    <Tooltip id={'read-only-view-tooltip'} title={'Check what is different in this version'}>
                        <IconButton onClick={() => {
                            showDiffFn(commit.root);
                        }}>
                            <Visibility/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip id={'revert-tooltip'} title={'Start editing from this version'}>
                        <IconButton onClick={() => {
                            //FIXE how to handle error... I guess modal popup warning???
                            project.setBranchHash('master', commit._id, activeCommit, (err) => {
                                onOK();
                            });
                        }}>
                            <PlayArrow/>
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
        });

        return (
            <Dialog open={true}>
                <DialogTitle>Project History</DialogTitle>
                <DialogContent>
                    <Grid container={true} style={{paddingTop: '24px'}} spacing={16}>
                        {items}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        let lastCommit = commits.length === 0 ? gmeClient.getActiveCommitHash() :
                            commits[commits.length - 1].parents[0];

                        gmeClient.getHistory(gmeClient.getProjectObject().projectId, lastCommit, batchSize, this.newHistoryItems);
                    }} color='secondary'>getMore</Button>
                    <Button onClick={onOK} color='primary'>OK</Button>
                </DialogActions>
                {showDiff ? this.getDiffDialog() : null}
            </Dialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectHistory);