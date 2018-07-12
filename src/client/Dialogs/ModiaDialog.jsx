import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import ModiaCodeGenerator from '../../plugins/ModiaCodeGenerator/ModiaCodeGenerator';

export default class ConfirmDialog extends React.Component {
    static propTypes = {
        onClose: PropTypes.func.isRequired,
        gmeClient: PropTypes.object.isRequired,
        nodeId: PropTypes.string.isRequired,
    };

    state = {
        modiaCode: 'Generating Modia code ...',
    }


    componentDidMount() {
        const {gmeClient, nodeId} = this.props;
        const pluginId = ModiaCodeGenerator.id;
        const context = gmeClient.getCurrentPluginContext(pluginId, nodeId);
        // TODO: Remove when engine is bumped
        // context.managerConfig.activeNode = nodeId;

        gmeClient.runBrowserPlugin(ModiaCodeGenerator, context, (err, result) => {
            if (err) {
                console.error(err);
            } else {
                console.log(result);
                this.setState({modiaCode: result.messages[0].message});
            }
        });
    }

    render() {
        const {modiaCode} = this.state;

        return (
            <div>
                <Dialog
                    fullWidth
                    maxWidth={false}
                    open
                    onClose={() => this.props.onClose()}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">Modia</DialogTitle>
                    <DialogContent style={{minHeight: '30vh', minWidth: '80hh'}}>
                        <pre>
                            {modiaCode}
                        </pre>
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
