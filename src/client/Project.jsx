// Libraries
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';

import List, { ListItem, ListItemText } from 'material-ui/List';
import Grid from 'material-ui/Grid';

// Own modules
import PartBrowser from './PartBrowser';
import AttributeEditor from './AttributeEditor';

export default class Project extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeNode: null,
            branch: null
        };
    }

    componentDidMount() {
        this.props.gmeClient.selectProject(this.props.projectId, 'master', (err) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log('selectedProject', this.props.projectId);
            this.setState({
                branch: this.props.gmeClient.getActiveBranchName(),
                activeNode: ''
            });
        });
    }

    render() {
        const {activeNode, branch} = this.state;

        let content = <div>Loading in project ...</div>;

        if (typeof activeNode === 'string') {
            content = (<div style={{flexGrow: 1, marginTop: 30}}>
                <h3>{`Branch ${branch} open for ${this.props.projectId}!`}</h3>
                <Grid container spacing={24}>
                    <Grid item xs={12} sm={6}>
                        <PartBrowser activeNode={activeNode} gmeClient={this.props.gmeClient}/>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <AttributeEditor activeNode={activeNode} gmeClient={this.props.gmeClient}/>
                    </Grid>
                </Grid>
            </div>);
        }

        return (
            <div>
                {content}
            </div>
        );
    }
}

Project.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired
};