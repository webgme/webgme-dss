import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import {withStyles} from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tooltip from '@material-ui/core/Tooltip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import getObjectSorter from '../gme/utils/getObjectSorter';

const styles = {
    domainBadge: {
        width: 24,
        height: 24,
        padding: 2,
        paddingTop: 12,
    },
    domainBadgeContainer: {
        display: 'inline-flex',
    },
};

class ProjectList extends Component {
    static propTypes = {
        projects: PropTypes.arrayOf(PropTypes.object),
        classes: PropTypes.object.isRequired,
    };

    static defaultProps = {
        projects: null,
    };

    render() {
        const {projects, classes} = this.props;

        let content = (
            <div style={{
                width: '100%',
                marginTop: 30,
            }}
            >
                <LinearProgress/>
                <br/>
                <LinearProgress color="secondary"/>
                <br/>
                <LinearProgress/>
            </div>);

        if (projects) {
            content = (
                <List>
                    {projects
                        .sort(getObjectSorter(['info', 'modifiedAt'], false, true))
                        .map((project) => {
                            let domains;
                            if (project.info.kind && project.info.kind.startsWith('DSS:')) {
                                domains = project.info.kind.substring('DSS:'.length)
                                    .split(':')
                                    .sort()
                                    .reverse()
                                    .map(domainUri => (
                                        <Tooltip
                                            key={domainUri}
                                            id={domainUri}
                                            placement="left"
                                            title={domainUri.substring('Modelica.'.length)}
                                        >
                                            <img
                                                alt={domainUri}
                                                src={`/assets/DecoratorSVG/${domainUri}.mini.png`}
                                                className={classes.domainBadge}
                                            />
                                        </Tooltip>));
                            }

                            return (
                                <Link
                                    key={project._id}
                                    to={`/p/${project.owner}/${project.name}`}
                                    style={{textDecoration: 'none'}}
                                >
                                    <ListItem button>
                                        <ListItemText primary={project.name}/>
                                        <ListItemSecondaryAction className={classes.domainBadgeContainer}>
                                            {domains}
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </Link>
                            );
                        })
                    }
                </List>);
        }

        return content;
    }
}


export default withStyles(styles)(ProjectList);
