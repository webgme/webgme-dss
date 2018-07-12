import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Card, {CardActions, CardContent} from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {connect} from 'react-redux';
import {setActiveSelection} from '../actions';

const mapStateToProps = (/* state */) => ({});

const mapDispatchToProps = dispatch => ({
    setActiveSelection: (id) => {
        dispatch(setActiveSelection(id));
    },
});

class PluginResultDialog extends Component {
    static propTypes = {
        onOK: PropTypes.func.isRequired,
        setActiveSelection: PropTypes.func.isRequired,
        result: PropTypes.object.isRequired,
        title: PropTypes.string,
    };

    static defaultProps = {
        title: 'Plugin results',
    };

    colors = {
        debug: '#f9f9f9',
        info: '#5bc0de',
        warning: '#428bca',
        error: '#d9534f',
    };

    render() {
        const {result, onOK, title} = this.props;

        const messages = result.messages.map((message) => {
            // message.activeNode.id
            const {severity, activeNode} = message;
            return (
                <Card style={{backgroundColor: this.colors[severity]}} raised>
                    <CardContent>
                        <Typography type="headline" component="h2">
                            {severity}
                        </Typography>
                        <Typography component="p">
                            {message.message}
                        </Typography>
                    </CardContent>
                    <CardActions>
                        <Button
                            size="small"
                            color="primary"
                            onClick={() => {
                                this.props.setActiveSelection([activeNode.id]);
                                onOK();
                            }}
                        >
                            Check node
                        </Button>
                    </CardActions>
                </Card>);
        });

        return (
            <Dialog open>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    {messages}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onOK} color="primary">OK</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PluginResultDialog);
