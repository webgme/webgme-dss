import React from 'react';
import PropTypes from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

function NotifyDialog(props) {
    return (
        <Dialog open>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogContent style={{display: 'flex'}}>
                {props.text}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onOK} color="primary">OK</Button>
            </DialogActions>
        </Dialog>
    );
}

NotifyDialog.propTypes = {
    title: PropTypes.string,
    text: PropTypes.string.isRequired,
    onOK: PropTypes.func.isRequired,
};

NotifyDialog.defaultProps = {
    title: 'Notification',
};

export default NotifyDialog;
