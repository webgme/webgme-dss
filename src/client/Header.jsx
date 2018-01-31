import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import MenuIcon from 'material-ui-icons/Menu';
import IconButton from 'material-ui/IconButton';
import {withStyles} from 'material-ui/styles';
import {toggleModelingView} from "./actions";

const styles = {

};

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
        branchName: PropTypes.string.isRequired,

        classes: PropTypes.object.isRequired
    };

    render() {
        const {projectName, projectOwner, branchName} = this.props;

        return (
            <AppBar color={this.props.modelingView ? 'primary': 'secondary'}>
                <Toolbar>
                    <IconButton aria-label="open side menu" onClick={() => {
                        this.props.toggleModelingView(!this.props.modelingView)
                    }}>
                        <MenuIcon/>
                    </IconButton>
                    <Typography type="title" color="inherit" noWrap>
                        {`Branch ${branchName} open for ${projectOwner} / ${projectName}`}
                    </Typography>
                </Toolbar>
            </AppBar>
        );
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Header));