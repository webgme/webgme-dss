import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import {LinearProgress} from 'material-ui/Progress';
import List, {ListItem, ListItemText} from 'material-ui/List';

import {nameSort} from './gme/utils/getObjectSorter';


export default class Projects extends Component {
    constructor(props) {
        super(props);
        this.state = {
            err: null,
            projects: null
        };

        this.getProjects = this.getProjects.bind(this);
    }

    componentDidMount() {
        this.getProjects();
    }

    getProjects() {
        this.props.gmeClient.getProjects({}, (err, projects) => {
            if (err) {
                console.error(err);
                return;
            }

            projects.sort(nameSort);

            this.setState({projects: projects});
        });
    }

    render() {
        const {projects} = this.state;

        let content = (
            <div style={{
                width: '100%',
                marginTop: 30
            }}>
                <LinearProgress/>
                <br/>
                <LinearProgress color="accent"/>
            </div>);

        if (projects) {
            content = (<List>
                {projects
                    .map(project => {
                        return (
                            <Link key={project._id} to={`/p/${project.owner}/${project.name}`}>
                                <ListItem button>
                                    <ListItemText primary={project.name}/>
                                </ListItem>
                            </Link>
                        )
                    })
                }
            </List>);
        }

        return content;
    }
}

Projects.propTypes = {
    gmeClient: PropTypes.object
};