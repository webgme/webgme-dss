import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Samy, SvgProxy} from 'react-samy-svg';
import {DragSource} from 'react-dnd';

import {DRAG_TYPES} from './CONSTANTS';

const testDiode = '<?xml version="1.0" encoding="utf-8" ?><svg baseProfile="full" height="210" version="1.1" viewBox="0 0 310.0 210" width="310.0" xmlns="http://www.w3.org/2000/svg" xmlns:ev="http://www.w3.org/2001/xml-events" xmlns:xlink="http://www.w3.org/1999/xlink"><defs /><polygon fill="rgb(255,255,255)" points="185.0,105.0 125.0,65.0 125.0,145.0 185.0,105.0" stroke="rgb(0,0,0)" stroke-width="0.25mm" /><defs /><polyline fill="none" points="65.0,105.0 195.0,105.0" stroke="rgb(0,0,255)" stroke-width="0.25mm" /><defs /><polyline fill="none" points="195.0,105.0 245.0,105.0" stroke="rgb(0,0,255)" stroke-width="0.25mm" /><defs /><polyline fill="none" points="185.0,65.0 185.0,145.0" stroke="rgb(0,0,255)" stroke-width="0.25mm" /><defs /><polyline fill="none" points="155.0,205.0 155.0,125.0" stroke="rgb(127,0,0)" stroke-dasharray="1.0 2.0" stroke-width="0.25mm" /><defs /><text alignment-baseline="middle" fill="rgb(0,0,255)" font-family="Verdana" font-size="18" text-anchor="middle" x="155.0" y="165.0">name</text><defs /><g id="heatPort"><rect fill="rgb(191,0,0)" height="40.0" stroke="rgb(191,0,0)" stroke-width="0.25mm" width="40.0" x="15.0" y="85.0" /><defs /><g display="none" id="info"><text id="name">heatPort</text><text id="type">Modelica.Thermal.HeatTransfer.Interfaces.HeatPort_a</text><text id="classDesc">Thermal port for 1-dim. heat transfer (filled rectangular icon)</text><text id="desc">Conditional heat port</text></g></g><g id="p"><rect fill="rgb(0,0,255)" height="40.0" stroke="rgb(0,0,255)" stroke-width="0.25mm" width="40.0" x="15.0" y="85.0" /><defs /><g display="none" id="info"><text id="name">p</text><text id="type">Modelica.Electrical.Analog.Interfaces.PositivePin</text><text id="classDesc">Positive pin of an electric component</text><text id="desc">Positive pin (potential p.v &gt; n.v for positive voltage drop v)</text></g></g><g id="n"><rect fill="rgb(255,255,255)" height="40.0" stroke="rgb(0,0,255)" stroke-width="0.25mm" width="40.0" x="15.0" y="85.0" /><defs /><g display="none" id="info"><text id="name">n</text><text id="type">Modelica.Electrical.Analog.Interfaces.NegativePin</text><text id="classDesc">Negative pin of an electric component</text><text id="desc">Negative pin</text></g></g></svg>';

const canvasItemSource = {
    beginDrag(props) {
        return {
            gmeId: props.nodeId,
            move: true,
            copy: false
        };
    }
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

class CanvasItem extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        nodeId: PropTypes.string.isRequired,
        connectDragSource: PropTypes.func.isRequired,
        isDragging: PropTypes.bool.isRequired
    };

    // constructor(props) {
    //     super(props);
    //
    // }

    render() {
        // return <Samy svgXML={testDiode} style={{height: '50px', width: '50px'}}/>;

        const {connectDragSource} = this.props;

        return connectDragSource(
            <div style={{opacity: 0.99}}>
                <Samy svgXML={testDiode} style={{height: '50px', width: '50px'}}/>
            </div>);
    }

}

export default DragSource(DRAG_TYPES.GME_NODE, canvasItemSource, collect)(CanvasItem);