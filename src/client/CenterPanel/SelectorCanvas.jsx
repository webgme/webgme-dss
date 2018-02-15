import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import SingleConnectedNode from '../gme/BaseComponents/SingleConnectedNode';
import SelectorCanvasItem from "./SelectorCanvasItem";
import BasicEventManager from '../gme/BaseComponents/BasicEventManager';

const mapStateToProps = state => {
    return {
        activeNode: state.plotData.nodeId,
        scale: state.scale
    }
};

const mapDispatchToProps = (/*dispatch*/) => {
    return {}
};

class SelectorCanvas extends SingleConnectedNode {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        scrollPos: PropTypes.object.isRequired,

        activeNode: PropTypes.string.isRequired,
        scale: PropTypes.number.isRequired
    };

    state = {
        children: [],
        nodeInfo: {}
    };

    em = null;

    offset = {x: 0, y: 0};

    constructor(props) {
        super(props);
        this.em = new BasicEventManager();
    }

    populateChildren(nodeObj) {
        let childrenIds = nodeObj.getChildrenIds(),
            newChildren;

        newChildren = childrenIds.map((id) => {
            return {id: id};
        });
        this.setState({
            children: newChildren,
            nodeInfo: {
                name: nodeObj.getAttribute('name')
            }
        });
    }

    onNodeLoad(nodeObj) {
        this.populateChildren(nodeObj, true);
    }

    onNodeUpdate(nodeObj) {
        this.populateChildren(nodeObj);
    }

    render() {
        const {activeNode, gmeClient} = this.props,
            {children} = this.state,
            self = this;

        console.log(activeNode);

        let childrenItems = children.map((child) => {
            return (<SelectorCanvasItem
                key={child.id}
                gmeClient={gmeClient}
                activeNode={child.id}
                contextNode={activeNode}
                eventManager={self.em}/>);
        });
        return (<div ref={(canvas) => {
            if (canvas)
                self.offset = {x: canvas.offsetParent.offsetLeft, y: canvas.offsetParent.offsetTop};
        }}
                     style={{
                         width: '100%',
                         height: '100%',
                         overflow: 'auto',
                         zIndex: 1,
                         position: 'relative'
                     }}>
            {childrenItems}
        </div>);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectorCanvas);