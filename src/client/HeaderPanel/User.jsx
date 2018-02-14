import React, {Component} from 'react';
import PropTypes from 'prop-types';
import superagent from 'superagent';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
import Cancel from 'material-ui-icons/Cancel';
import AccountCircle from 'material-ui-icons/AccountCircle';
import Typography from 'material-ui/Typography';

export default class User extends Component {
    static propTypes = {
        useWebGMEColors: PropTypes.bool
    };

    static defaultProps = {
        useWebGMEColors: false
    };

    state = {
        userInfo: null
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
                this.setState({userInfo: userInfo});
            });
    }

    render() {
        const {userInfo} = this.state,
            {useWebGMEColors} = this.props;
        let accountStyle = {}, nameStyle = {}, logoutStyle = {};

        if (userInfo === null)
            return null;

        if (useWebGMEColors) {
            nameStyle = {color: '#70AD47'};
            accountStyle = {color: '#00B0F0'};
            logoutStyle = {color: '#FF0000'};
        }
        // console.log(userInfo);
        return [<Typography type={'subheading'} style={nameStyle}>{userInfo._id}</Typography>,
            (<Tooltip title={'Profile'}>
                <IconButton>
                    <a href="/profile/home"><AccountCircle style={accountStyle}/></a>
                </IconButton>
            </Tooltip>),
            (<Tooltip title={'Log out'}>
                <IconButton>
                    <a href="/logout"><Cancel style={logoutStyle}/></a>
                </IconButton>
            </Tooltip>)];
    }
}