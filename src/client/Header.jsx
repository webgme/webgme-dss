import React, {Component} from 'react';
import PropTypes from 'prop-types';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import MenuIcon from 'material-ui-icons/Menu';
import IconButton from 'material-ui/IconButton';
import {withStyles} from 'material-ui/styles';

const styles = {

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
            <AppBar>
                <Toolbar>
                    <IconButton color="contrast" aria-label="open side menu">
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


export default withStyles(styles)(Header);