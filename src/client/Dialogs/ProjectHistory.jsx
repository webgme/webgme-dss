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
import DiffViewer from './DiffViewer';

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
        activeCommit: this.props.gmeClient.getActiveCommitHash(),
        showDiff: false,
        diffWithRoot: null,
    };

    componentDidMount() {
        const {gmeClient, batchSize} = this.props;
        const {activeCommit} = this.state;

        gmeClient.getHistory(gmeClient.getProjectObject().projectId, activeCommit, batchSize, this.newHistoryItems);
    }

    showDiff = (oldRootHash) => {
        this.setState({
            showDiff: true,
            diffWithRoot: oldRootHash,
        });
    };

    closeDiff = () => {
        this.setState({
            showDiff: false,
            diffWithRoot: null,
        });
    }

    newHistoryItems = (err, items) => {
        // console.log(JSON.stringify(items, null, 2));
        if (!err) {
            this.setState({commits: this.state.commits.concat(items)});
        }
    };

    render() {
        const {gmeClient, batchSize} = this.props;
        const {
            commits,
            activeCommit,
            showDiff,
            diffWithRoot,
        } = this.state;

        const project = gmeClient.getProjectObject();

        const items = commits.map((commit) => {
            const when = new Date(parseInt(commit.time, 10));
            const current = commit._id === this.state.activeCommit;

            return (
                <Grid
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
                                this.showDiff(commit.root);
                            }}
                            >
                                <Visibility/>
                            </IconButton>
                        </Tooltip>
                        <Tooltip id="revert-tooltip" title="Revert back to this">
                            <IconButton onClick={() => {
                                // FIXE how to handle error... I guess modal popup warning???
                                project.setBranchHash('master', commit._id, activeCommit, this.props.onOK);
                            }}
                            >
                                <PlayArrow/>
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

                            gmeClient.getHistory(
                                gmeClient.getProjectObject().projectId,
                                lastCommit,
                                batchSize,
                                this.newHistoryItems,
                            );
                        }}
                        color="secondary"
                    >getMore
                    </Button>
                    <Button onClick={this.props.onOK} color="primary">OK</Button>
                </DialogActions>
                {showDiff ? <DiffViewer gmeClient={gmeClient} oldRootHash={diffWithRoot} onOK={this.closeDiff}/> : null}
            </Dialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectHistory);
