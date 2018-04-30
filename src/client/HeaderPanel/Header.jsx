import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import IconButton from 'material-ui/IconButton';
import Save from 'material-ui-icons/Save';
import Tooltip from 'material-ui/Tooltip';

import {appHeader as style} from '../styles';

import SyncIndicator from './SyncIndicator';
import Zoom from './Zoom';
import User from '../containers/HeaderPanel/User';
import SaveDialog from '../Dialogs/SaveDialog';

const mapStateToProps = state => ({
    modelingView: state.modelingView,
});

const mapDispatchToProps = (/* dispatch */) => ({});

class Header extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        projectName: PropTypes.string.isRequired,
        modelingView: PropTypes.bool.isRequired,
    };


    state = {
        saving: false,
    };

    render() {
        const {projectName, modelingView, gmeClient} = this.props;
        const {saving} = this.state;

        return (
            <AppBar color={modelingView ? 'primary' : 'default'}>
                <Toolbar style={style}>
                    <SyncIndicator gmeClient={gmeClient}/>
                    <Typography variant="title" color="inherit" noWrap>
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
                                    this.setState({saving: true});
                                }}
                            />
                        </IconButton>
                    </Tooltip>
                    <Zoom/>
                    <Typography style={{flex: 1}}/>
                    <User gmeClient={gmeClient}/>
                </Toolbar>
                {saving ?
                    <SaveDialog
                        gmeClient={gmeClient}
                        onClose={() => {
                            this.setState({saving: false});
                        }}
                    />
                    : null}
            </AppBar>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
