/* globals window */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link, withRouter} from 'react-router-dom';
import superagent from 'superagent';

import {connect} from 'react-redux';

import {withStyles} from 'material-ui/styles';
import Card, {CardActions, CardContent, CardMedia} from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import {CircularProgress} from 'material-ui/Progress';
import Grid from 'material-ui/Grid';

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
        projects: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
        classes: PropTypes.object.isRequired,
        history: PropTypes.arrayOf(PropTypes.string).isRequired,
        setSystemWaiting: PropTypes.func.isRequired,
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

        //console.log('create data:', data);

        const path = [
            window.location.origin,
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
                    history.push(`/p/${owner}/${name}`);
                }
            });
    };

    render() {
        const {projects, classes} = this.props;

        const cards = TEMPLATE_PROJECTS.map((seedInfo) => {
            const {infoUrl} = seedInfo;
            const buttons = [];
            if (projects) {
                const createBtn = (
                    <Button
                        key="createBtn"
                        dense
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
                            dense
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
                <Grid item lg={6} key={seedInfo.title}>
                    <Card>
                        <CardMedia
                            className={classes.media}
                            image={seedInfo.imageUrl}
                            title={seedInfo.title}
                        />
                        <CardContent className={classes.cardContent}>
                            <Typography type="headline" component="h2">
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
