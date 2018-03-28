/* globals window */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import superagent from 'superagent';
import Button from 'material-ui/IconButton';
import Menu, {MenuItem} from 'material-ui/Menu';
import AccountCircle from 'material-ui-icons/AccountCircle';

export default class User extends Component {
    static propTypes = {
        color: PropTypes.string,
        gmeClient: PropTypes.object.isRequired,
    };

    static defaultProps = {
        color: undefined,
    }

    state = {
        anchorEl: null,
        userInfo: null,
        // userInfo: {
        //     _id: 'guest',
        // },
    };

    componentDidMount() {
        superagent.get('/api/user')
            .end((err, res) => {
                let userInfo;

                if (err) {
                    userInfo = null;
                } else {
                    userInfo = res.body;
                }

                this.setState({userInfo});
            });
    }

    openMenu = (event) => {
        this.setState({anchorEl: event.currentTarget});
    };

    closeMenu = () => {
        this.setState({anchorEl: null});
    };

    goToProfile = () => {
        const tempAnchor = window.document.createElement('a');
        tempAnchor.target = '_self';
        tempAnchor.href = '/profile/home';
        window.document.body.appendChild(tempAnchor);
        tempAnchor.click();
    };

    logout = () => {
        const {gmeClient} = this.props;
        const tempAnchor = window.document.createElement('a');
        tempAnchor.target = '_self';
        tempAnchor.href = '/logout';
        window.document.body.appendChild(tempAnchor);
        window.document.cookie = `${gmeClient.gmeConfig.authentication.jwt.cookieId}\
=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        window.parent.postMessage('logout', '*');

        tempAnchor.click();
    };

    render() {
        const {userInfo, anchorEl} = this.state;
        const {color} = this.props;

        if (userInfo === null) {
            return null;
        }

        return (
            <div>
                <Button size="small" onClick={this.openMenu} style={{width: '100%', color}}>
                    <AccountCircle/>
                    <span style={{marginLeft: 5, fontSize: 16}}> {userInfo._id}</span>
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
