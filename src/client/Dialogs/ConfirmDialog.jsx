import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';

export default class ConfirmDialog extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        message: PropTypes.string.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    render() {
        const {title, message} = this.props;

        return (
            <div>
                <Dialog
                    open
                    onClose={() => this.props.onClose(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {message}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.props.onClose(false)} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={() => this.props.onClose(true)} color="primary" autoFocus>
                            OK
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}
