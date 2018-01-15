import React, {Component} from 'react';
import PropTypes from 'prop-types';

export default class PartBrowser extends Component {
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

    componentDidMount() {
        const self = this,
            client = this.props.gmeClient;

        function updateValidChildren(nodeObj) {
            let childrenDesc = nodeObj.getValidChildrenTypesDetailed(),
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
            self.setState({
                loaded: true,
                validChildren: validChildren
            });
        }

        function eventHandler(events) {
            let i,
                nodeObj;

            for (i = 0; i < events.length; i += 1) {
                if (events[i].etype === 'load') {
                    nodeObj = client.getNode(events[i].eid);
                    updateValidChildren(nodeObj);
                } else if (events[i].etype === 'update') {
                    nodeObj = client.getNode(events[i].eid);
                    updateValidChildren(nodeObj);
                } else if (events[i].etype === 'unload') {

                } else {
                    // "Technical events" not used.
                }
            }
        }

        this.uiId = client.addUI(null, eventHandler);

        console.log('Update territory', this.territory);
        client.updateTerritory(this.uiId, this.territory);
    }

    componentWillUnmount() {
        this.props.gmeClient.removeUI(this.uiId);
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