import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import OTConsole from '../OTConsole';

export default class ConfirmDialog extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        onClose: PropTypes.func.isRequired,
        gmeClient: PropTypes.object.isRequired,
        attributeName: PropTypes.string.isRequired,
        nodeId: PropTypes.string,
    };

    static defaultProps = {
        nodeId: null,
    };

    render() {
        const {
            title,
            gmeClient,
            attributeName,
            nodeId,
        } = this.props;

        return (
            <div>
                <Dialog
                    fullWidth
                    maxWidth="lg"
                    open
                    onClose={() => this.props.onClose()}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                    <DialogContent style={{minHeight: '30vh'}}>
                        <OTConsole gmeClient={gmeClient} attributeName={attributeName} nodeId={nodeId}/>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.props.onClose()} color="primary" autoFocus>
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}
