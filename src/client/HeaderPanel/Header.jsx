import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {appHeader as style} from '../styles';

import SyncIndicator from './SyncIndicator';
import Zoom from './Zoom';
import User from './User';

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

    render() {
        const {projectName, modelingView, gmeClient} = this.props;

        return (
            <AppBar color={modelingView ? 'primary' : 'default'}>
                <Toolbar style={style}>
                    <SyncIndicator gmeClient={gmeClient}/>
                    <Typography variant="title" color="inherit" noWrap>
                        {projectName}
                    </Typography>
                    <Zoom/>
                    <Typography style={{flex: 1}}/>
                    <User/>
                </Toolbar>
            </AppBar>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
