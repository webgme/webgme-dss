import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import PlayCircleOutline from 'material-ui-icons/PlayCircleOutline';
import CheckCircle from 'material-ui-icons/CheckCircle';
import AddCircle from 'material-ui-icons/AddCircle';
import {withStyles} from 'material-ui/styles';

import PartBrowser from './PartBrowser';
import PluginConfigDialog from './PluginConfigDialog';

const SIDE_PANEL_WIDTH = 300;
const HEADER_HEIGHT = 64;

const styles = {
    drawerPaper: {
        width: SIDE_PANEL_WIDTH,
        overflow: 'auto',
        top: HEADER_HEIGHT
    }
};

class LeftDrawer extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        activeNode: PropTypes.string.isRequired,
        scale: PropTypes.number.isRequired,
        open: PropTypes.bool.isRequired,

        classes: PropTypes.object.isRequired
    };

    state = {
        simulateDialog: false
    };

    render() {
        const {classes, activeNode, gmeClient, scale, open} = this.props;

        return (
            <div>
            <Drawer type="persistent" anchor="left" open={open} classes={{paper: classes.drawerPaper}}>
                <span>
                <IconButton onClick={this.onLeftMenuClose}>
                    <ChevronLeftIcon/>
                </IconButton>
                <IconButton onClick={() => { this.setState({simulateDialog: true}); }}>
                    <CheckCircle/>
                </IconButton>
                <IconButton onClick={() => { this.setState({simulateDialog: true}); }}>
                    <PlayCircleOutline/>
                </IconButton>
                <IconButton onClick={() => { this.setState({simulateDialog: true}); }}>
                    <AddCircle/>
                </IconButton>
                </span>
                <PartBrowser activeNode={activeNode} gmeClient={gmeClient} scale={scale}/>
            </Drawer>
                {this.state.simulateDialog ? (<PluginConfigDialog onReady={(config) => {
                                                                    console.log('config set:', config);
                                                                    this.setState({simulateDialog: false});
                                                                }}
                                                                onCancel={() => {
                                                                    console.log('canceled');
                                                                    this.setState({simulateDialog: false});
                                                                }}/>) : null}
            </div>
        );
    }
}


export default withStyles(styles)(LeftDrawer);