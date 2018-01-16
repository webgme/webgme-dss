import React from 'react';
import PropTypes from 'prop-types';
import SingleConnectedNode from './gme/BaseComponents/SingleConnectedNode';

import Chip from 'material-ui/Chip';

class Canvas extends SingleConnectedNode {
    state = {
        children: [],
        nodeInfo: {}
    };

    //constructor(props) {
    //    super(props);
    //}

    onNodeLoad(nodeObj) {
        var childrenIds = nodeObj.getChildrenIds();

        this.setState({
            children: childrenIds.map((id) => {
                return {id: id};
            }),
            nodeInfo: {
                name: nodeObj.getAttribute('name')
            }
        });
    }

    onNodeUpdate(nodeObj) {

    }

    render() {
        let children = this.state.children.map((child) => {
            return <Chip key={child.id} label={child.id}/>
        });

        return (
            <div>
                <h4>{`Node ${this.state.nodeInfo.name} open`}</h4>
                {children}
        </div>);
    }
}

Canvas.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    activeNode: PropTypes.string.isRequired
};

export default Canvas;