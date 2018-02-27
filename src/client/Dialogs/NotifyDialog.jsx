import React from 'react';
import PropTypes from 'prop-types';

import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';

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
