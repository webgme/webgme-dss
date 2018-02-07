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
        activeCommit: null
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

    render() {
        const {onOK, gmeClient, batchSize} = this.props,
            {commits, activeCommit} = this.state,
            project = gmeClient.getProjectObject(),
            projectId = project.projectId;
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
                {current ? <Avatar>C</Avatar> : <Avatar/>}
                <Grid item={true} xs={12} sm={6}>{commit.message}</Grid>
                <Grid item={true} xs={5} sm={3} zeroMinWidth={true}>
                    <Tooltip id={'read-only-view-tooltip'} title={'Check what is different in this version'}>
                        <IconButton>
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
            </Dialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectHistory);