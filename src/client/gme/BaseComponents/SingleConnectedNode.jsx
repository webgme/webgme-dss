import {Component} from 'react';
import PropTypes from 'prop-types';

/**
 * Base class that defines a territory for a single node.
 * Use this as base if your component is only interested in the node itself
 * (not any children or other custom territories).
 */
export default class SingleConnectedNode extends Component {
    constructor(props) {
        super(props);
        const {activeNode} = this.props || {};

        this.uiId = null;
        this.territory = {};
        if (typeof activeNode === 'string') {
            this.territory[activeNode] = {children: 0};
        }
    }

    componentDidMount() {
        const {gmeClient} = this.props;

        this.uiId = gmeClient.addUI(null, (events) => {
            let didChange = false;
            for (let i = 0; i < events.length; i += 1) {
                if (events[i].etype === 'load') {
                    this.onNodeLoad(gmeClient.getNode(events[i].eid));
                    didChange = true;
                } else if (events[i].etype === 'update') {
                    this.onNodeUpdate(gmeClient.getNode(events[i].eid));
                    didChange = true;
                } else if (events[i].etype === 'unload') {
                    this.onNodeUnload(events[i].eid);
                    didChange = true;
                } else {
                    // "Technical events" not used.
                }
            }

            if (!didChange) {
                this.onStateChanged();
            }
        });

        gmeClient.updateTerritory(this.uiId, this.territory);
    }

    componentWillReceiveProps(nextProps) {
        const {gmeClient, activeNode} = this.props;
        const nextNode = nextProps.activeNode;

        if (nextNode !== activeNode) {
            this.territory = {[nextNode]: {children: 0}};
            gmeClient.updateTerritory(this.uiId, this.territory);
        }
    }

    componentWillUnmount() {
        const {gmeClient} = this.props;

        gmeClient.removeUI(this.uiId);
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

    /**
     * Called whenever the client switches state and does not load, update or unload the node.
     */
    onStateChanged() {

    }


}

SingleConnectedNode.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    activeNode: PropTypes.string.isRequired,
};
