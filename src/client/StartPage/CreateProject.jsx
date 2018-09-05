/* globals window */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link, withRouter} from 'react-router-dom';
import superagent from 'superagent';

import {connect} from 'react-redux';

import {withStyles} from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';

import {setSystemWaiting} from '../actions';
import DomainSelector from '../Dialogs/DomainSelector';
import TEMPLATE_PROJECTS from './templateProjects.json';

// http://www.publicdomainpictures.net

const styles = theme => ({
    cardContent: {
        minHeight: 160,
    },
    media: {
        height: 120,
    },
    progress: {
        margin: `0 ${theme.spacing.unit * 2}px`,
    },
});

const mapStateToProps = (/* state */) => ({});

const mapDispatchToProps = dispatch => ({
    setSystemWaiting: (isWaiting) => {
        dispatch(setSystemWaiting(isWaiting));
    },
});

class CreateProject extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        projects: PropTypes.arrayOf(PropTypes.object),
        classes: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        setSystemWaiting: PropTypes.func.isRequired,
    };

    static defaultProps = {
        projects: null,
    };

    state = {
        showDialog: false,
        createData: null,
    };

    onCreateNewClick = (createData) => {
        this.setState({
            createData,
            showDialog: true,
        });
    };

    onCreateNewProject = (data) => {
        const {gmeClient, history} = this.props;

        this.setState({showDialog: false});
        if (!data) {
            // Cancelled
            return;
        }

        // console.log('create data:', data);

        const path = [
            window.location.origin + gmeClient.mountedPath,
            gmeClient.gmeConfig.rest.components.DomainManager.mount,
            'createProject',
        ].join('/');

        this.props.setSystemWaiting(true);

        superagent.post(path)
            .send({
                projectName: data.name,
                domains: data.domains,
            })
            .end((err, result) => {
                if (err) {
                    // TODO: we need to show these errors
                    console.error(err);
                } else {
                    // console.log(result);
                    const [owner, name] = result.body.projectId.split('+');
                    history.push(`${gmeClient.mountedPath}/p/${owner}/${name}`);
                }
            });
    };

    render() {
        const {projects, classes, gmeClient} = this.props;

        const cards = TEMPLATE_PROJECTS.map((seedInfo) => {
            const {infoUrl} = seedInfo;
            const buttons = [];
            if (projects) {
                const createBtn = (
                    <Button
                        key="createBtn"
                        size="small"
                        color="primary"
                        onClick={() => {
                            this.onCreateNewClick(seedInfo.createData);
                        }}
                    >
                        Create
                    </Button>);

                buttons.push(createBtn);

                if (infoUrl) {
                    const infoBtn = (
                        <Button
                            key="infoBtn"
                            size="small"
                            color="primary"
                            component={Link}
                            to={infoUrl}
                            target="_blank"
                        >
                            Learn More
                        </Button>);

                    buttons.push(infoBtn);
                }
            } else {
                buttons.push(<CircularProgress key="progress" className={classes.progress}/>);
            }

            return (
                <Grid item lg={6} md={12} sm={6} xs={12} key={seedInfo.title}>
                    <Card>
                        <CardMedia
                            className={classes.media}
                            image={`${gmeClient.mountedPath}/${seedInfo.imageUrl}`}
                            title={seedInfo.title}
                        />
                        <CardContent className={classes.cardContent}>
                            <Typography variant="headline">
                                {seedInfo.title}
                            </Typography>
                            <Typography component="p">
                                {seedInfo.description}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            {buttons}
                        </CardActions>
                    </Card>
                </Grid>
            );
        });

        const {showDialog, createData} = this.state;
        return (
            <div>
                <Grid container spacing={24}>
                    {cards}
                </Grid>

                {showDialog ?
                    <DomainSelector
                        title="Create New Project"
                        onOK={this.onCreateNewProject}
                        onCancel={this.onCreateNewProject}
                        defaultName={createData.defaultName}
                        takenNames={projects
                            .filter(pInfo => pInfo.owner === 'guest') // FIXME: We need to get user info
                            .map(pInfo => pInfo.name)
                        }
                        domains={createData.domains}
                        showDomainSelection={createData.domains.length === 0}
                    /> : null}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(withStyles(styles)(CreateProject)));
