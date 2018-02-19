import React, {Component} from 'react';
import Modal from 'material-ui/Modal';
import {LinearProgress} from 'material-ui/Progress';

export default class ModalSpinner extends Component {
    render() {
        const {visible} = this.props;
        return (
            <Modal open={visible}>
                {visible ? <div style={{position: 'absolute', top: '50%', width: '100%'}}>
                    <LinearProgress />
                    <br />
                    <LinearProgress color="secondary" />
                    <br />
                    <LinearProgress />
                           </div> : null}
            </Modal>
        );
    }
}
