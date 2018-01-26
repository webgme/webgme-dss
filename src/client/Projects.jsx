import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {nameSort} from './gme/utils/getObjectSorter';
import ProjectList from './ProjectList';
import CreateProject from './CreateProject';

import Grid from 'material-ui/Grid';
// import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';


export default class Projects extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired
    };

    state = {
        err: null,
        projects: null
    };

    componentDidMount() {
        this.getProjects();
    }

    getProjects = () => {
        this.props.gmeClient.getProjects({info: true, rights: true}, (err, projects) => {
            if (err) {
                console.error(err);
                return;
            }

            projects.sort(nameSort);

            this.setState({projects: projects});
        });
    };

    render() {
        return (
            <div style={{flexGrow: 1, margin: 20}}>
                <Grid container spacing={24}>
                    <Grid item lg={7}>
                        {/*<Paper elevation={4}>*/}
                        <CreateProject gmeClient={this.props.gmeClient} projects={this.state.projects}/>
                        {/*</Paper>*/}
                    </Grid>
                    <Grid item lg={5}>
                        {/*<Paper elevation={4}>*/}
                            <Typography type="title">
                                CURRENT PROJECTS
                            </Typography>
                            <ProjectList gmeClient={this.props.gmeClient} projects={this.state.projects}/>
                        {/*</Paper>*/}
                    </Grid>
                </Grid>
            </div>);
    }
}

Projects.propTypes = {
    gmeClient: PropTypes.object
};