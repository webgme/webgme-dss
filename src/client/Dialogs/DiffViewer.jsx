import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import List, {ListItem, ListItemText} from 'material-ui/List';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import {CircularProgress} from 'material-ui/Progress';

import Button from 'material-ui/Button';

import ModelicaDiffMetadata from '../../plugins/ModelicaDiff/metadata.json';

class DiffViewer extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        oldRootHash: PropTypes.string.isRequired,
        onOK: PropTypes.func.isRequired,
    };

    state = {
        diff: null,
    };

    componentDidMount() {
        const pluginId = ModelicaDiffMetadata.id;
        const {gmeClient, oldRootHash} = this.props;
        const context = gmeClient.getCurrentPluginContext(pluginId, '');

        context.pluginConfig = {oldRootHash};

        gmeClient.runServerPlugin(pluginId, context, (err, result) => {
            if (err) {
                console.error(err);
            } else if (result.success) {
                this.setState({
                    diff: JSON.parse(result.messages[0].message),
                });
            } else {
                console.error(result);
            }
        });
    }

    render() {
        const {diff} = this.state;
        let info;
        let domain;
        let simulation;
        let model;

        if (diff === null) {
            info = (<CircularProgress size={50}/>);
        } else if (diff.model === null && diff.domain === null && diff.simulation === null) {
            info = 'There are no apparent differences';
        }

        // domain
        if (diff && diff.domain !== null) {
            domain = [
                (
                    <ListItem
                        button
                        onClick={() => {
                            this.setState({diff_domain_open: !this.state.diff_domain_open});
                        }}
                    >
                        <ListItemText inset primary="Domain changes"/>
                        {this.state.diff_domain_open ? <ExpandLess/> : <ExpandMore/>}
                    </ListItem>
                ),
                (
                    <Collapse in={this.state.diff_domain_open} timeout="auto">
                        <List dense>
                            {diff.domain.map(item => <ListItem><ListItemText inset primary={item}/></ListItem>)}
                        </List>
                    </Collapse>
                ),
            ];
        }

        // simulation
        if (diff && diff.simulation !== null) {
            simulation = [
                (
                    <ListItem
                        button
                        onClick={() => {
                            this.setState({diff_simulation_open: !this.state.diff_simulation_open});
                        }}
                    >
                        <ListItemText inset primary="Simulation result changes"/>
                        {this.state.diff_simulation_open ? <ExpandLess/> : <ExpandMore/>}
                    </ListItem>
                ),
                (
                    <Collapse in={this.state.diff_simulation_open} timeout="auto">
                        <List dense>
                            {diff.simulation.map(item => <ListItem><ListItemText inset primary={item}/></ListItem>)}
                        </List>
                    </Collapse>
                ),
            ];
        }

        // model
        if (diff && diff.model !== null) {
            const nodeElements = [];
            const nodes = Object.keys(diff.model);

            nodes.forEach((node) => {
                const stateName = `diff_model_open_${node}`;

                nodeElements.push((
                    <ListItem
                        button
                        onClick={() => {
                            const newState = {};
                            newState[stateName] = !this.state[stateName];
                            this.setState(newState);
                        }}
                    >
                        <ListItemText inset primary={node}/>
                        {this.state[stateName] ? <ExpandLess/> : <ExpandMore/>}
                    </ListItem>));

                nodeElements.push((
                    <Collapse in={this.state[stateName]} timeout="auto">
                        <List dense>
                            {diff.model[node].map(item => <ListItem><ListItemText inset primary={item}/></ListItem>)}
                        </List>
                    </Collapse>));
            });

            model = [
                (
                    <ListItem
                        button
                        onClick={() => {
                            this.setState({diff_model_open: !this.state.diff_model_open});
                        }}
                    >
                        <ListItemText inset primary="Model"/>
                        {this.state.diff_model_open ? <ExpandLess/> : <ExpandMore/>}
                    </ListItem>
                ),
                (
                    <Collapse in={this.state.diff_model_open} timeout="auto">
                        <List dense>
                            {nodeElements}
                        </List>
                    </Collapse>
                ),
            ];
        }

        return (
            <Dialog open style={{minWidth: 400}}>
                <DialogTitle>Differences</DialogTitle>
                <DialogContent>
                    {info}
                    <List dense>
                        {domain}
                        {model}
                        {simulation}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            this.props.onOK();
                        }}
                        color="primary"
                    >OK
                    </Button>
                </DialogActions>
            </Dialog>);
    }
}

export default DiffViewer;
