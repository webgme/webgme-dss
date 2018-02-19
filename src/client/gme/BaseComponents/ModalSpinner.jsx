import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from 'material-ui/Modal';
import {LinearProgress} from 'material-ui/Progress';

export default class ModalSpinner extends Component {
    static propTypes = {
        visible: PropTypes.bool,
    };

    static defaultProps = {
        visible: false,
    };

    render() {
        const {visible} = this.props;
        return (
            <Modal open={visible}>
                <div style={{position: 'absolute', top: '50%', width: '100%'}}>
                    <LinearProgress/>
                    <br/>
                    <LinearProgress color="secondary"/>
                    <br/>
                    <LinearProgress/>
                </div>
            </Modal>
        );
    }
}
