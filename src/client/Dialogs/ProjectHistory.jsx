import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import moment from 'moment';
import Button from 'material-ui/Button';
import Badge from 'material-ui/Badge';
import {connect} from 'react-redux';
import IconButton from 'material-ui/IconButton';
import Visibility from 'material-ui-icons/Visibility';
import PlayArrow from 'material-ui-icons/PlayArrow';
import Grid from 'material-ui/Grid';
import Tooltip from 'material-ui/Tooltip';
import NotifyDialog from './NotifyDialog';
import List, {ListItem, ListItemText} from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';

import ModelicaDiffMetadata from '../../plugins/ModelicaDiff/metadata';

const mapStateToProps = (/* state */) => ({});

const mapDispatchToProps = (/* dispatch */) => ({});

class ProjectHistory extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        onOK: PropTypes.func.isRequired,
        batchSize: PropTypes.number,
    };

    static defaultProps = {
        batchSize: 10,
    };

    state = {
        commits: [],
        activeCommit: null,
        showDiff: false,
        diff: null,
    };

    showDiff = (oldRootHash) => {
        const self = this,
            pluginId = ModelicaDiffMetadata.id,
            {gmeClient} = this.props;
        const context = gmeClient.getCurrentPluginContext(pluginId, '');

        context.pluginConfig = {oldRootHash};
        console.log(context);

        gmeClient.runServerPlugin(pluginId, context, (err, result) => {
            if (err) {
                console.error(err);
            } else if (result.success) {
                self.setState({
                    showDiff: true,
                    diff: JSON.parse(result.messages[0].message),
                });
            } else {
                console.error(result);
            }
        });
    };

    newHistoryItems = (err, items) => {
        console.log(JSON.stringify(items, null, 2));
        if (!err) { this.setState({commits: this.state.commits.concat(items)}); }
    };

    componentDidMount() {
        const {gmeClient, batchSize} = this.props,
            activeCommit = gmeClient.getActiveCommitHash();

        gmeClient.getHistory(gmeClient.getProjectObject().projectId, activeCommit, batchSize, this.newHistoryItems);
        this.setState({activeCommit});
    }

    getDiffDialog = () => {
        const {diff} = this.state;
        let domain,
            simulation,
            model;

        if (diff === null || (diff.model === null && diff.domain === null && diff.simulation === null)) {
            return (<NotifyDialog
                text="No difference with the current state."
                title=" "
                onOK={() => {
                    this.setState({showDiff: false});
                }}
            />);
        }

        // domain
        if (diff.domain === null) {
            domain = (<ListItem button={false}>
                <ListItemText inset={false} primary="Domains" secondary="no change" />
                      </ListItem>);
        } else {
            domain = [
                (<ListItem
                    button
                    onClick={() => {
                        this.setState({diff_domain_open: !this.state.diff_domain_open});
                    }}
                >
                    <ListItemText inset primary="Domain changes" />
                    {this.state.diff_domain_open ? <ExpandLess /> : <ExpandMore />}
                 </ListItem>),
                (<Collapse in={this.state.diff_domain_open} timeout="auto">
                    <List dense>
                        {diff.domain.map(item => <ListItem><ListItemText inset primary={item} /></ListItem>)}
                    </List>
                 </Collapse>),
            ];
        }

        // simulation
        if (diff.simulation === null) {
            simulation = (<ListItem button={false}>
                <ListItemText inset={false} primary="Simulations" secondary="no change" />
                          </ListItem>);
        } else {
            simulation = [
                (<ListItem
                    button
                    onClick={() => {
                        this.setState({diff_simulation_open: !this.state.diff_simulation_open});
                    }}
                >
                    <ListItemText inset primary="Simulation result changes" />
                    {this.state.diff_simulation_open ? <ExpandLess /> : <ExpandMore />}
                 </ListItem>),
                (<Collapse in={this.state.diff_simulation_open} timeout="auto">
                    <List dense>
                        {diff.simulation.map(item => <ListItem><ListItemText inset primary={item} /></ListItem>)}
                    </List>
                 </Collapse>),
            ];
        }

        // model
        if (diff.model === null) {
            model = (<ListItem button={false}>
                <ListItemText inset={false} primary="Model" secondary="no change" />
                     </ListItem>);
        } else {
            let nodeElements = [],
                nodes = Object.keys(diff.model);
            nodes.forEach((node) => {
                const stateName = `diff_model_open_${node}`;
                nodeElements.push((<ListItem
                    button
                    onClick={() => {
                        const newState = {};
                        newState[stateName] = !this.state[stateName];
                        this.setState(newState);
                    }}
                >
                    <ListItemText inset primary={node} />
                    {this.state[stateName] ? <ExpandLess /> : <ExpandMore />}
                                   </ListItem>));
                nodeElements.push(<Collapse in={this.state[stateName]} timeout="auto">
                    <List dense>
                        {diff.model[node].map(item => <ListItem><ListItemText inset primary={item} /></ListItem>)}
                    </List>
                                  </Collapse>);
            });

            model = [(<ListItem
                button
                onClick={() => {
                    this.setState({diff_model_open: !this.state.diff_model_open});
                }}
            >
                <ListItemText inset primary="Model" />
                {this.state.diff_model_open ? <ExpandLess /> : <ExpandMore />}
                      </ListItem>),
                (<Collapse in={this.state.diff_model_open} timeout="auto">
                    <List dense>
                        {nodeElements}
                    </List>
                 </Collapse>)];
        }
        return (<Dialog open>
            <DialogTitle>Differences</DialogTitle>
            <DialogContent>
                <List dense>
                    {domain}
                    {model}
                    {simulation}
                </List>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        this.setState({showDiff: false, diff: null});
                    }}
                    color="primary"
                >OK
                </Button>
            </DialogActions>
                </Dialog>);
    };

    render() {
        const {onOK, gmeClient, batchSize} = this.props,
            {commits, activeCommit, showDiff} = this.state,
            project = gmeClient.getProjectObject(),
            showDiffFn = this.showDiff;
        const items = commits.map((commit) => {
            let when = new Date(parseInt(commit.time, 10)),
                current = commit._id === this.state.activeCommit;

            return (<Grid
                key={commit._id}
                container
                wrap="wrap"
                style={{
                    border: '2px solid #000000',
                    color: current ? 'red' : 'blue',
                    margin: '2px',
                    marginLeft: '-6px',
                }}
                alignItems="center"
                color={current ? 'primary' : 'secondary'}
            >
                <Grid item xs={4} sm={2} style={{cursor: 'help'}}>
                    <Tooltip id="time-tooltip" title={moment(when).local().format('dddd, MMMM Do YYYY, h:mm:ss a')}>
                        <Grid item><Badge content={moment(when).fromNow()}>{commit.updater[0]}</Badge></Grid>
                    </Tooltip>
                </Grid>
                <Grid item xs={12} sm={6}>{commit.message}</Grid>
                <Grid item xs={5} sm={3} zeroMinWidth>
                    <Tooltip id="read-only-view-tooltip" title="Check what is different in this version">
                        <IconButton onClick={() => {
                            showDiffFn(commit.root);
                        }}
                        >
                            <Visibility />
                        </IconButton>
                    </Tooltip>
                    <Tooltip id="revert-tooltip" title="Start editing from this version">
                        <IconButton onClick={() => {
                            const {setBranchHash} = project;
                            // FIXE how to handle error... I guess modal popup warning???
                            setBranchHash('master', commit._id, activeCommit, onOK);
                        }}
                        >
                            <PlayArrow />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>);
        });

        return (
            <Dialog open>
                <DialogTitle>Project History</DialogTitle>
                <DialogContent>
                    <Grid container style={{paddingTop: '24px'}} spacing={16}>
                        {items}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            const lastCommit = commits.length === 0 ? gmeClient.getActiveCommitHash() :
                                commits[commits.length - 1].parents[0];

                            gmeClient.getHistory(gmeClient.getProjectObject().projectId, lastCommit, batchSize, this.newHistoryItems);
                        }}
                        color="secondary"
                    >getMore
                    </Button>
                    <Button onClick={onOK} color="primary">OK</Button>
                </DialogActions>
                {showDiff ? this.getDiffDialog() : null}
            </Dialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectHistory);
