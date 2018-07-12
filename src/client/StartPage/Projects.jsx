import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
// import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import ProjectList from './ProjectList';
import CreateProject from './CreateProject';


export default class Projects extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
    };

    state = {
        projects: null,
    };

    componentDidMount() {
        this.getProjects();
    }

    getProjects = () => {
        this.props.gmeClient.getProjects({info: true, rights: true}, (err, projects) => {
            if (err) {
                console.error('Todo: Display error!', err);
                return;
            }

            const dssProjects = projects.filter(pInfo => pInfo.info.kind && pInfo.info.kind.startsWith('DSS:'));

            this.setState({projects: dssProjects});
        });
    };

    render() {
        return (
            <div style={{flexGrow: 1, margin: 20}}>
                <Grid container spacing={24}>
                    <Grid item lg={7} md={5} xs={12}>
                        {/* <Paper elevation={4}> */}
                        <CreateProject gmeClient={this.props.gmeClient} projects={this.state.projects}/>
                        {/* </Paper> */}
                    </Grid>
                    <Grid item lg={5} md={7} xs={12}>
                        {/* <Paper elevation={4}> */}
                        <Typography variant="title">
                                CURRENT PROJECTS
                        </Typography>
                        <ProjectList gmeClient={this.props.gmeClient} projects={this.state.projects}/>
                        {/* </Paper> */}
                    </Grid>
                </Grid>
            </div>);
    }
}
