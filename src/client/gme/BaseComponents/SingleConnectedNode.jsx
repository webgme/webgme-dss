import React, {Component} from 'react';
import PropTypes from 'prop-types';

/**
 * Base class that defines a territory for a single node.
 * Use this as base if your component is only interested in the node itself
 * (not any children or other custom territories).
 */
export default class SingleConnectedNode extends Component {
    constructor(props) {
        super(props);

        this.uiId = null;
        this.territory = {};
        this.territory[this.props.activeNode] = {children: 0};
    }

    componentDidMount() {
        const client = this.props.gmeClient;

        this.uiId = client.addUI(null, (events) => {
            for (let i = 0; i < events.length; i += 1) {
                if (events[i].etype === 'load') {
                    this.onNodeLoad(client.getNode(events[i].eid));
                } else if (events[i].etype === 'update') {
                    this.onNodeUpdate(client.getNode(events[i].eid));
                } else if (events[i].etype === 'unload') {
                    this.onNodeUnload(events[i].eid);
                } else {
                    // "Technical events" not used.
                }
            }
        });

        client.updateTerritory(this.uiId, this.territory);
    }

    /**
     * Called when the node is initially loaded
     * @param {GMENode} nodeObj
     */
    onNodeLoad(nodeObj) {
        console.warn('onNodeLoad is not overwritten', nodeObj);
    }

    /**
     * Called each time the node is updated
     * @param {GMENode} nodeObj
     */
    onNodeUpdate(nodeObj) {
        console.warn('onNodeUpdate is not overwritten', nodeObj);
    }

    /**
     * Called if the node is removed
     * @param {string} nodeId
     */
    onNodeUnload(nodeId) {
        console.warn('onNodeUnload is not overwritten', nodeId);
    }

    componentWillUnmount() {
        this.props.gmeClient.removeUI(this.uiId);
    }
}

SingleConnectedNode.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    activeNode: PropTypes.string.isRequired
};