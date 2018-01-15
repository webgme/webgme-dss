import React from 'react';
import PropTypes from 'prop-types';

import ExpansionPanel, {
    ExpansionPanelDetails,
    ExpansionPanelSummary
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import Chip from 'material-ui/Chip';

import SingleConnectedNode from './gme/BaseComponents/SingleConnectedNode';
import getObjectSorter from './gme/utils/getObjectSorter';

const TREE_PATH_SEP = '$';
const nameSort = getObjectSorter('name', true);

export default class PartBrowser extends SingleConnectedNode {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            validChildren: []
        };
    }

    onNodeLoad(nodeObj) {
        const client = this.props.gmeClient,
            childrenDesc = nodeObj.getValidChildrenTypesDetailed();

        // All children are meta-nodes -> thus available right away
        let validChildren = Object.keys(childrenDesc).map((id) => {
            let metaNode = client.getNode(id);
            return {
                id: metaNode.getId(),
                name: metaNode.getAttribute('name'),
                treePath: typeof this.props.treePathGetter === 'function' ? this.props.treePathGetter(metaNode) : null,
                active: childrenDesc[id]
            };
        });

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
        let tree = {children: [], folders: {}, path: 'ROOT'};

        if (!this.state.loaded) {
            return (<div>Loading node in Part Browser ...</div>);
        }

        this.state.validChildren
            .forEach(function (childDesc) {
                let treeNode = tree;

                if (typeof childDesc.treePath === 'string') {
                    childDesc.treePath.split(TREE_PATH_SEP)
                        .forEach(function (path, i, arr) {
                            if (i === arr.length - 1) {
                                treeNode.children.push(childDesc);
                            } else {
                                if (!treeNode.folders[path]) {
                                    treeNode.folders[path] = {
                                        isFolder: true,
                                        name: path,
                                        path: treeNode.path + '$' + path,
                                        description: 'Something is here',
                                        folders: {},
                                        children: []
                                    };

                                    treeNode.children.push(treeNode.folders[path]);
                                }

                                treeNode = treeNode.folders[path];
                            }
                        });
                } else {
                    treeNode.children.push(childDesc);
                }
            });

        function getExpPanelRec(treeNode) {
            if (treeNode.isFolder) {
                return (
                    <ExpansionPanel key={treeNode.path}>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            {treeNode.name}
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            {treeNode.children.sort(nameSort).map(getExpPanelRec)}
                        </ExpansionPanelDetails>
                    </ExpansionPanel>);
            } else {
                // TODO: This should be a draggable item
                return (
                    <Chip label={treeNode.name} key={treeNode.id}/>
                )
            }
        }

        return (
            <div>
                {tree.children.map(getExpPanelRec)}
            </div>
        );
    }
}

PartBrowser.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    activeNode: PropTypes.string.isRequired,
    treePathGetter: PropTypes.func
};