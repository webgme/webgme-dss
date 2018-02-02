import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import Card, {CardActions, CardContent} from 'material-ui/Card';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import {connect} from 'react-redux';
import {setActiveSelection} from "../actions";

const mapStateToProps = state => {
    return {}
};

const mapDispatchToProps = dispatch => {
    return {
        setActiveSelection: id => {
            dispatch(setActiveSelection(id))
        }
    }
};
class PluginResultDialog extends Component {
    static propTypes = {
        onOK: PropTypes.func.isRequired,
        result: PropTypes.object.isRequired,
        title: PropTypes.string
    };

    colors = {
        debug: '#f9f9f9',
        info: '#5bc0de',
        warning: '#428bca',
        error: '#d9534f'
    };

    render() {
        const {result, onOK, title, setActiveSelection} = this.props,
            colors = this.colors;
        let messages = result.messages.map((message) => {
            //message.activeNode.id
            return (<Card style={{backgroundColor: colors[message.severity]}} raised={true}>
                <CardContent>
                    <Typography type="headline" component="h2">
                        {message.severity}
                    </Typography>
                    <Typography component="p">
                        {message.message}
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button size="small" color="primary" onClick={() => {
                        setActiveSelection([message.activeNode.id]);
                        onOK();
                    }}>
                        Check node
                    </Button>
                </CardActions>
            </Card>);
        });

        return (
            <Dialog open={true}>
                <DialogTitle>{title || 'Plugin results'}</DialogTitle>
                <DialogContent>
                    {messages}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onOK} color='primary'>OK</Button>
                </DialogActions>
            </Dialog>
        );
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(PluginResultDialog);