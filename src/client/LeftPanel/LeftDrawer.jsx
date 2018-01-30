import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import classNames from 'classnames';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import ChevronRightIcon from 'material-ui-icons/ChevronRight';
import PlayCircleOutline from 'material-ui-icons/PlayCircleOutline';
import CheckCircle from 'material-ui-icons/CheckCircle';
import AddCircle from 'material-ui-icons/AddCircle';
import {withStyles} from 'material-ui/styles';

import {toggleLeftDrawer} from '../actions';

import PartBrowser from './PartBrowser';
import PluginConfigDialog from '../PluginConfigDialog';

import ConsoleDialog from '../ConsoleDialog';
import OTConsoleTest from '../OTConsoleTest';

const SIDE_PANEL_WIDTH = 240;
const SIDE_PANEL_WIDTH_MINIMIZED = 50;
const HEADER_HEIGHT = 64;

const styles = theme => ({
    drawerPaper: {
        width: SIDE_PANEL_WIDTH,
        overflow: 'auto',
        top: HEADER_HEIGHT
    },
    drawerPaperClose: {
        width: SIDE_PANEL_WIDTH_MINIMIZED,
        overflowX: 'hidden'
    }
});

const mapStateToProps = state => {
    return {
        open: state.leftDrawer
    }
};

const mapDispatchToProps = dispatch => {
    return {
        hide: () => {
            dispatch(toggleLeftDrawer(false));
        },
        show: () => {
            dispatch(toggleLeftDrawer(true));
        }
    }
};

class LeftDrawer extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,

        open: PropTypes.bool.isRequired,

        classes: PropTypes.object.isRequired
    };

    state = {
        simulateDialog: false,
        simluateConsole: false,
        simulateOT: false
    };

    render() {
        const {classes, gmeClient, open} = this.props;
        return (
            <div>
                <Drawer type="permanent"
                        anchor="left"
                        open={open}
                        classes={{paper: classNames(classes.drawerPaper, !open && classes.drawerPaperClose)}}>
                <span>
                <IconButton onClick={open ? this.props.hide : this.props.show}>
                    {open ? <ChevronLeftIcon/> : <ChevronRightIcon/>}
                </IconButton>
                <IconButton onClick={() => {
                    this.setState({simulateDialog: true});
                }}>
                    <CheckCircle/>
                </IconButton>
                <IconButton onClick={() => {
                    this.setState({simulateConsole: true});
                }}>
                    <PlayCircleOutline/>
                </IconButton>
                <IconButton onClick={() => {
                    this.setState({simulateOT: true});
                }}>
                    <AddCircle/>
                </IconButton>
                </span>
                    <Divider/>
                    <PartBrowser gmeClient={gmeClient} minimized={!open}/>

                </Drawer>
                {this.state.simulateDialog ? (<PluginConfigDialog onReady={(config) => {
                    console.log('config set:', config);
                    this.setState({simulateDialog: false});
                }}
                                                                  onCancel={() => {
                                                                      console.log('canceled');
                                                                      this.setState({simulateDialog: false});
                                                                  }}/>) : null}
                {this.state.simulateConsole ? (<ConsoleDialog onReady={(config) => {
                    this.setState({simulateConsole: false});
                }}/>) : null}
                {this.state.simulateOT ? (<OTConsoleTest
                    onReady={(config) => {
                        this.setState({simulateOT: false});
                    }}
                    gmeClient={gmeClient}
                    nodeId={'/Z/Z'}
                    attributeName={'name'}/>) : null}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LeftDrawer));