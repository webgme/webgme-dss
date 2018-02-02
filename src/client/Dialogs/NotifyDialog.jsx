import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button'

export default class NotifyDialog extends Component {
    static propTypes = {
        title: PropTypes.string,
        text: PropTypes.string.isRequired,
        onOK: PropTypes.func.isRequired
    };

    render() {

        const {text, onOK, title} = this.props;

        return (
            <Dialog open={true}>
                <DialogTitle>{title || 'Notification'}</DialogTitle>
                <DialogContent style={{display: 'flex'}}>
                    {text}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onOK} color='primary'>OK</Button>
                </DialogActions>
            </Dialog>
        );
    }
}