import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';

import IconButton from '@material-ui/core/IconButton';
import Save from '@material-ui/icons/Save';
import Tooltip from '@material-ui/core/Tooltip';

import {appHeader as style} from '../styles';

import SyncIndicator from './SyncIndicator';
import Zoom from './Zoom';
import User from '../containers/HeaderPanel/User';
import SaveDialog from '../Dialogs/SaveDialog';
import ModiaDialog from '../Dialogs/ModiaDialog';

const mapStateToProps = state => ({
    modelingView: state.modelingView,
    activeNode: state.activeNode,
});

const mapDispatchToProps = (/* dispatch */) => ({});

class Header extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        projectName: PropTypes.string.isRequired,
        modelingView: PropTypes.bool.isRequired,
        activeNode: PropTypes.string.isRequired,
    };

    state = {
        showSave: false,
        showModia: false,
    };

    showModia = () => {

    };

    render() {
        const {
            projectName,
            modelingView,
            gmeClient,
            activeNode,
        } = this.props;
        const {showSave, showModia} = this.state;

        return (
            <AppBar color={modelingView ? 'primary' : 'default'}>
                <Toolbar style={style}>
                    <SyncIndicator gmeClient={gmeClient}/>
                    <Typography
                        variant="title"
                        color="inherit"
                        noWrap
                        onClick={() => {
                            if (gmeClient.gmeConfig.plugin.ModiaCodeGenerator &&
                                gmeClient.gmeConfig.plugin.ModiaCodeGenerator.enable) {
                                this.setState({showModia: true});
                            }
                        }}
                    >
                        {projectName}
                    </Typography>
                    <Tooltip
                        key="save-tooltip"
                        id="save-tooltip"
                        title="Save current version of the model."
                        style={{
                            marginLeft: '50px',
                            marginRight: '-60px',
                        }}
                    >
                        <IconButton>
                            <Save
                                onClick={() => {
                                    this.setState({showSave: true});
                                }}
                            />
                        </IconButton>
                    </Tooltip>
                    <Zoom/>
                    <Typography style={{flex: 1}}/>
                    <User gmeClient={gmeClient}/>
                </Toolbar>
                {showSave ?
                    <SaveDialog
                        gmeClient={gmeClient}
                        onClose={() => {
                            this.setState({showSave: false});
                        }}
                    />
                    : null}
                {showModia ?
                    <ModiaDialog
                        gmeClient={gmeClient}
                        nodeId={activeNode}
                        onClose={() => {
                            this.setState({showModia: false});
                        }}
                    />
                    : null}
            </AppBar>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
