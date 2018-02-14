import React, {Component} from 'react';
import superagent from 'superagent';
import IconButton from 'material-ui/IconButton';
import Tooltip from 'material-ui/Tooltip';
import Cancel from 'material-ui-icons/Cancel';
import AccountCircle from 'material-ui-icons/AccountCircle';
import Typography from 'material-ui/Typography';

export default class User extends Component {
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
        const {userInfo} = this.state;
        if (userInfo === null)
            return null;

        // console.log(userInfo);
        return [<Typography type={'subheading'}>{userInfo._id}</Typography>,
            (<Tooltip title={'Profile'}>
                <IconButton>
                    <a href="/profile/home"><AccountCircle/></a>
                </IconButton>
            </Tooltip>),
            (<Tooltip title={'Log out'}>
                <IconButton>
                    <a href="/logout"><Cancel/></a>
                </IconButton>
            </Tooltip>)];
    }
}