import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogTitle,
} from 'material-ui/Dialog';
import Button from 'material-ui/Button';

import OTConsole from './OTConsole';
import ot from 'webgme-ot';


//FIXME this will not work as currently the client can have only a single channel
export default class OTConsoleTest extends Component {
    static propTypes = {
        onReady: PropTypes.func.isRequired,
        gmeClient: PropTypes.object.isRequired,
        nodeId: PropTypes.string.isRequired,
        attributeName: PropTypes.string.isRequired
    };

    state = {
        timerId: null,
        docId: null,
        project: null,
        document: null
    };

    timeToChange = () => {
        const {project, docId, document} = this.state,
            text = 'adding something to the beggining\n';

        project.sendDocumentOperation({
            docId: docId,
            operation: new ot.TextOperation().retain(document.length).insert(text)
        });
        this.setState({document: document + text});

    };

    onTest = (initData) => {
        const {gmeClient} = this.props;
        let timerId = setInterval(this.timeToChange, 2000);

        this.setState({
            timerId: timerId,
            docId: initData.docId,
            project: gmeClient.getProjectObject(),
            document: initData.document
        });
    };

    onReady = () => {
        clearInterval(this.state.timerId);
        this.props.onReady();
    };

    render() {
        const {gmeClient, nodeId, attributeName} = this.props;

        return (
            <Dialog open={true}>
                <DialogTitle>Console Test</DialogTitle>
                <DialogContent style={{height: '500px', width: '550px'}}>
                    <OTConsole gmeClient={gmeClient} nodeId={nodeId} attributeName={attributeName}
                               onTest={this.onTest}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.onReady} color='primary'>Done</Button>
                </DialogActions>
            </Dialog>
        );
    }
};