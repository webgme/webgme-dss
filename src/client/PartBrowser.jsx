import React, {Component} from 'react';
import PropTypes from 'prop-types';
import SingleConnectedNode from './gme/BaseComponents/SingleConnectedNode';

export default class PartBrowser extends SingleConnectedNode {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            validChildren: []
        };

        this.uiId = null;
        this.territory = {};
        this.territory[this.props.activeNode] = {children: 0};
    }

    onNodeLoad(nodeObj) {
        let client = this.props.gmeClient,
            childrenDesc = nodeObj.getValidChildrenTypesDetailed(),
            validChildren;

        // All children are meta-nodes -> thus available right away
        validChildren = Object.keys(childrenDesc).map((id) => {
            let metaNode = client.getNode(id);
            return {
                id: metaNode.getId(),
                name: metaNode.getAttribute('name'),
                active: childrenDesc[id]
            };
        });

        console.log(validChildren);

        // TODO: This is probably not the most efficient way of updating the state.
        this.setState({
            loaded: true,
            validChildren: validChildren
        });
    }

    onNodeUpdate(nodeObj) {

    }

    onNodeUnload(nodeId) {

    }

    render() {
        let content;

        if (!this.state.loaded) {
            return (<div>Loading node in Part Browser ...</div>);
        }

        content = this.state.validChildren
            .map(function (childDesc) {
                return <div key={childDesc.id}>{childDesc.name}</div>;
            });

        return (
            <div>
                {content}
            </div>
        );
    }
}

PartBrowser.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    activeNode: PropTypes.string.isRequired
};