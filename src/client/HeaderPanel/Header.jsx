import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import {appHeader as style} from '../styles';

import Zoom from './Zoom';
import User from './User';

import logo from '../logo.svg';

const mapStateToProps = state => {
    return {
        modelingView: state.modelingView
    }
};

const mapDispatchToProps = (/*dispatch*/) => {
    return {}
};

class Header extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        projectName: PropTypes.string.isRequired,
        projectOwner: PropTypes.string.isRequired,
        branchName: PropTypes.string.isRequired
    };

    render() {
        const {projectName, modelingView} = this.props;

        return (
            <AppBar color={modelingView ? 'primary' : 'default'}>
                <Toolbar style={style}>
                    <Link to={''} style={{textDecoration: 'none'}}>
                        <img src={logo} alt="logo" style={{height: 40, marginLeft: -15, marginRight: 30}}/>
                    </Link>
                    <Typography type="title" color="inherit" noWrap>
                        {/*{this.props.modelingView ? `Edit ${branchName} branch of ${projectOwner} / ${projectName}` :*/}
                        {/*`Simulations of ${branchName} branch of ${projectOwner} / ${projectName}`}*/}
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