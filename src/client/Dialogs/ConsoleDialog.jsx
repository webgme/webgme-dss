import React from 'react';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';

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
