import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import MenuIcon from 'material-ui-icons/Menu';
import EditMode from 'material-ui-icons/Edit';
import MultilineChart from 'material-ui-icons/MultilineChart';
import IconButton from 'material-ui/IconButton';
import {toggleModelingView} from "./actions";
import {appHeader as style} from "./styles";


const mapStateToProps = state => {
    return {
        modelingView: state.modelingView
    }
};

const mapDispatchToProps = dispatch => {
    return {
        toggleModelingView: (modeling) => {
            dispatch(toggleModelingView(modeling));
        }
    }
};

class Header extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        projectName: PropTypes.string.isRequired,
        projectOwner: PropTypes.string.isRequired,
        branchName: PropTypes.string.isRequired
    };

    render() {
        const {projectName, projectOwner, branchName} = this.props;

        return (
            <AppBar color={this.props.modelingView ? 'primary' : 'secondary'}>
                <Toolbar style={style}>
                    <IconButton aria-label="open side menu" onClick={() => {
                        this.props.toggleModelingView(!this.props.modelingView)
                    }}>
                        {this.props.modelingView ? <EditMode/> : <MultilineChart/>}
                    </IconButton>
                    <Typography type="title" color="inherit" noWrap>
                        {/*{this.props.modelingView ? `Edit ${branchName} branch of ${projectOwner} / ${projectName}` :*/}
                         {/*`Simulations of ${branchName} branch of ${projectOwner} / ${projectName}`}*/}
                        {projectName}
                    </Typography>
                </Toolbar>
            </AppBar>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);