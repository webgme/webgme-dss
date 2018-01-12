import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button} from 'material-ui';
import List, { ListItem, ListItemText } from 'material-ui/List';
import {Link} from 'react-router-dom';

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
        this.props.gmeClient.getProjects({}, (err, projects) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log('projects', projects);
            this.setState({projects: projects});
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
                        <Link to={`/p/${project.owner}/${project.name}`}>
                            <ListItem button>
                                <ListItemText primary={project.name}/>
                            </ListItem>
                        </Link>
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