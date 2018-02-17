import React, {Component} from 'react';
import {connect} from 'react-redux';
import IconButton from 'material-ui/IconButton';
import ZoomIn from 'material-ui-icons/ZoomIn';
import ZoomOut from 'material-ui-icons/ZoomOut';
import Tooltip from 'material-ui/Tooltip';
import {setScale} from "../actions";

const scales = [0.2, 0.3, 0.4, 0.6, 0.8, 1, 1.2, 1.5, 2, 3, 5];

const mapStateToProps = state => {
    return {
        scale: state.scale
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setScale: newScale => {
            dispatch(setScale(newScale))
        }
    }
};

class Zoom extends Component {

    zoomIn = () => {
        const {setScale, scale} = this.props,
            scaleIndex = scales.indexOf(scale);
        if (scaleIndex < scales.length - 1)
            setScale(scales[scaleIndex + 1]);
    };

    zoomOut = () => {
        const {setScale, scale} = this.props,
            scaleIndex = scales.indexOf(scale);
        if (scaleIndex > 0)
            setScale(scales[scaleIndex - 1]);
    };

    render() {
        const {scale} = this.props,
            scaleIndex = scales.indexOf(scale);

        return [
            (<Tooltip id={'Zoom-in-tooltip'}
                      title={scaleIndex === scales.length - 1 ? '' : 'Increase scale to ' +
                          scales[scaleIndex + 1] + '.'}>
                <IconButton onClick={this.zoomIn} disabled={scaleIndex === scales.length}
                            style={{marginLeft: '50px', marginRight: '-10px'}}>
                    <ZoomIn/>
                </IconButton>
            </Tooltip>),
            (<Tooltip id={'Zoom-in-tooltip'}
                      title={scaleIndex === 0 ? '' : 'Decrease scale to ' + scales[scaleIndex - 1] + '.'}>
                <IconButton onClick={this.zoomOut} disabled={scaleIndex === 0}>
                    <ZoomOut/>
                </IconButton>
            </Tooltip>)
        ];
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Zoom);