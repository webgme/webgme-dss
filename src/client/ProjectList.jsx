import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import { withStyles } from 'material-ui/styles';
import {LinearProgress} from 'material-ui/Progress';
import List, {ListItem, ListItemText, ListItemSecondaryAction} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';

import {nameSort} from './gme/utils/getObjectSorter';

const styles = {
    domainBadge: {
        width: 24,
        height: 24,
        padding: 2,
        paddingTop: 12
    },
    domainBadgeContainer: {
        display: 'inline-flex'
    }
};

class ProjectList extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        projects: PropTypes.array,
        classes: PropTypes.object.isRequired
    };

    render() {
        const {projects, classes} = this.props;

        let content = (
            <div style={{
                width: '100%',
                marginTop: 30
            }}>
                <LinearProgress/>
                <br/>
                <LinearProgress color="secondary"/>
                <br/>
                <LinearProgress/>
            </div>);

        if (projects) {
            content = (<List>
                {projects
                    .map(project => {
                        let domains;
                        if (project.info.kind && project.info.kind.startsWith('DSS:')) {
                            domains = project.info.kind.substring('DSS:'.length)
                                .split(':')
                                .sort()
                                .reverse()
                                .map(function (domainUri) {
                                    return (<img key={domainUri}
                                                    src={`/assets/DecoratorSVG/${domainUri}.mini.png`}
                                                    className={classes.domainBadge}/>)
                                });
                        }

                        return (
                            <Link key={project._id} to={`/p/${project.owner}/${project.name}`}
                                  style={{ textDecoration: 'none'}}>
                                <ListItem button>
                                    <ListItemText primary={project.name}/>
                                    <ListItemSecondaryAction className={classes.domainBadgeContainer}>
                                        {domains}
                                    </ListItemSecondaryAction>
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


export default withStyles(styles)(ProjectList);