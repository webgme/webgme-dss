import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import IconButton from 'material-ui/IconButton';
import ZoomIn from 'material-ui-icons/ZoomIn';
import ZoomOut from 'material-ui-icons/ZoomOut';
import Tooltip from 'material-ui/Tooltip';
import {setScale} from '../actions';

const SCALES = [0.2, 0.3, 0.4, 0.6, 0.8, 1, 1.2, 1.5, 2, 3, 5];

const mapStateToProps = state => ({
    scale: state.scale,
});

const mapDispatchToProps = dispatch => ({
    setScale: (newScale) => {
        dispatch(setScale(newScale));
    },
});

class Zoom extends Component {
    static propTypes = {
        scale: PropTypes.number.isRequired,
        setScale: PropTypes.func.isRequired,
    };

    zoomIn = () => {
        const {scale} = this.props;
        const scaleIndex = SCALES.indexOf(scale);

        if (scaleIndex < SCALES.length - 1) {
            this.props.setScale(SCALES[scaleIndex + 1]);
        }
    };

    zoomOut = () => {
        const {scale} = this.props;
        const scaleIndex = SCALES.indexOf(scale);

        if (scaleIndex > 0) {
            this.props.setScale(SCALES[scaleIndex - 1]);
        }
    };

    render() {
        const {scale} = this.props;
        const scaleIndex = SCALES.indexOf(scale);

        return [
            (
                <Tooltip
                    key="Zoom-in-tooltip"
                    id="Zoom-in-tooltip"
                    title={scaleIndex === SCALES.length - 1 ? '' : `Increase scale to ${
                        SCALES[scaleIndex + 1]}.`}
                >
                    <IconButton
                        onClick={this.zoomIn}
                        disabled={scaleIndex === SCALES.length}
                        style={{marginLeft: '50px', marginRight: '-10px'}}
                    >
                        <ZoomIn/>
                    </IconButton>
                </Tooltip>),
            (
                <Tooltip
                    key="Zoom-out-tooltip"
                    id="Zoom-out-tooltip"
                    title={scaleIndex === 0 ? '' : `Decrease scale to ${SCALES[scaleIndex - 1]}.`}
                >
                    <IconButton onClick={this.zoomOut} disabled={scaleIndex === 0}>
                        <ZoomOut/>
                    </IconButton>
                </Tooltip>),
        ];
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Zoom);
