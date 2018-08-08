/* globals window */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AccountCircle from '@material-ui/icons/AccountCircle';

export default class User extends Component {
    static propTypes = {
        color: PropTypes.string,
        gmeClient: PropTypes.object.isRequired,
        userInfo: PropTypes.object.isRequired,
    };

    static defaultProps = {
        color: undefined,
    }

    state = {
        anchorEl: null,
    };

    openMenu = (event) => {
        this.setState({anchorEl: event.currentTarget});
    };

    closeMenu = () => {
        this.setState({anchorEl: null});
    };

    goToProfile = () => {
        const {gmeClient} = this.props;
        const tempAnchor = window.document.createElement('a');
        tempAnchor.target = '_self';
        tempAnchor.href = `${gmeClient.mountedPath}/profile/home`;
        window.document.body.appendChild(tempAnchor);
        tempAnchor.click();
    };

    logout = () => {
        const {gmeClient} = this.props;
        const tempAnchor = window.document.createElement('a');
        tempAnchor.target = '_self';
        tempAnchor.href = `${gmeClient.mountedPath}/logout`;
        window.document.body.appendChild(tempAnchor);
        window.document.cookie = `${gmeClient.gmeConfig.authentication.jwt.cookieId}\
=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        window.parent.postMessage('logout', '*');

        tempAnchor.click();
    };

    render() {
        const {anchorEl} = this.state;
        const {userInfo, color} = this.props;

        if (userInfo === null) {
            return null;
        }

        return (
            <div>
                <Button size="small" onClick={this.openMenu} style={{width: '100%', color}}>
                    <AccountCircle/>
                    <span style={{marginLeft: 5, fontSize: 16}}> {userInfo.displayName || userInfo._id}</span>
                </Button>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.closeMenu}
                >
                    <MenuItem onClick={this.goToProfile}>Profile Page</MenuItem>
                    <MenuItem onClick={this.logout}>Logout</MenuItem>
                </Menu>
            </div>);
    }
}
