import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import SingleConnectedNode from '../gme/BaseComponents/SingleConnectedNode';
import SelectorCanvasItem from './SelectorCanvasItem';
import BasicEventManager from '../gme/BaseComponents/BasicEventManager';

import ZLEVELS from '../gme/utils/zLevels';

const mapStateToProps = state => ({
    activeNode: state.plotData.nodeId,
    scale: state.scale,
});

const mapDispatchToProps = (/* dispatch */) => ({});

class SelectorCanvas extends SingleConnectedNode {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        scrollPos: PropTypes.object.isRequired,

        activeNode: PropTypes.string.isRequired,
        scale: PropTypes.number.isRequired,
    };

    state = {
        children: [],
        nodeInfo: {},
    };

    em = null;

    offset = {
        x: 0,
        y: 0,
    };

    constructor(props) {
        super(props);
        this.em = new BasicEventManager();
    }

    populateChildren(nodeObj) {
        const childrenIds = nodeObj.getChildrenIds();
        const newChildren = childrenIds.map(id => ({id}));

        this.setState({
            children: newChildren,
            nodeInfo: {
                name: nodeObj.getAttribute('name'),
            },
        });
    }

    onNodeLoad(nodeObj) {
        this.populateChildren(nodeObj, true);
    }

    onNodeUpdate(nodeObj) {
        this.populateChildren(nodeObj);
    }

    render() {
        const {activeNode, gmeClient} = this.props;
        const {children} = this.state;

        const childrenItems = children.map(child => (<SelectorCanvasItem
            key={child.id}
            gmeClient={gmeClient}
            activeNode={child.id}
            contextNode={activeNode}
            eventManager={this.em}
        />));

        return (
            <div
                ref={(canvas) => {
                    if (canvas) {
                        const {offsetLeft, offsetTop} = canvas.offsetParent;
                        this.offset = {
                            x: offsetLeft,
                            y: offsetTop,
                        };
                    }
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    zIndex: ZLEVELS.canvas,
                    position: 'absolute',
                    backroundColor: 'white',
                }}
            >
                {childrenItems}
            </div>);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectorCanvas);
