import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'material-ui';
import List, { ListItem, ListItemText } from 'material-ui/List';

export default class Projects extends Component {
    constructor(props) {
        super(props);
        this.state = {
            err: null,
            projects: null
        };

        this.getProjects = this.getProjects.bind(this);
    }

    getProjects() {
        debugger;
        this.props.gmeClient.getProjects({}, (err, projects) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log('projects', projects);
            this.setState({projects: projects});
            //this.setState({err, projects});
        });
    }

    render() {
        const {projects} = this.state;

        let content = (<Button raised color="primary" onClick={this.getProjects}>
            {"View Projects"}
        </Button>);

        if (projects) {
            content = (<List>
                {projects
                    .map(project => {
                        return (
                            <ListItem button>
                                <ListItemText primary={project.name}/>
                            </ListItem>
                        )
                    })
                }
            </List>)
        }

        return content;
    }
}

Projects.propTypes = {
    gmeClient: PropTypes.object
};