//TODO: Consider using https://github.com/alexcurtis/react-treebeard for tree view.
import React from 'react';
import PropTypes from 'prop-types';

import ExpansionPanel, {
    ExpansionPanelDetails,
    ExpansionPanelSummary
} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import {Treebeard, decorators, theme} from 'react-treebeard';


import SingleConnectedNode from './gme/BaseComponents/SingleConnectedNode';
import {nameSort} from './gme/utils/getObjectSorter';

import PartBrowserItem from './PartBrowserItem';

const TREE_PATH_SEP = '$';

class TreeContainer extends decorators.Container {
    renderToggleDecorator() {
        const {style, node} = this.props;

        if (node.isRoot) {
            return <div/>;
        }
        else {
            return <decorators.Toggle style={style.toggle}/>;
        }
    }
}


export default class PartBrowser extends SingleConnectedNode {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            validChildren: [],
            cursor: null
        };

        this.tree = {};

        // TODO: Match these with the theme from material-ui
        theme.tree.base.backgroundColor = 'white';
        theme.tree.base.color = 'black';
        theme.tree.node.activeLink.background = 'lightgrey';
        theme.tree.node.toggle.arrow.fill = 'grey';
        theme.tree.node.header.base.color = 'black';
        theme.tree.node.loading.color = 'orange';


        this.theme = theme;

        const defaultHeader = decorators.Header;
        decorators.Container = TreeContainer;

        decorators.Header = (props) => {
            if (props.node.isRoot) {
                return <div/>;
            } else if (props.node.isFolder) {
                return defaultHeader(props);
            }

            return <PartBrowserItem treeNode={props.node}/>
        };
    }

    componentWillUpdate(nextProps, nextState) {
        // TODO: Revise this check when/if incremental updates to validChildren will be done.
        if (nextState.validChildren !== this.state.validChildren) {
            // Build up a new tree structure.
            this.tree = {children: [], folders: {}, path: 'ROOT'};

            nextState.validChildren
                .forEach((childDesc) => {
                    let treeNode = this.tree;

                    if (typeof childDesc.treePath === 'string') {
                        childDesc.treePath.split(TREE_PATH_SEP)
                            .forEach((path, i, arr) => {
                                if (i === arr.length - 1) {
                                    treeNode.children.push(childDesc);
                                } else {
                                    if (!treeNode.folders[path]) {
                                        treeNode.folders[path] = {
                                            isFolder: true,
                                            isRoot: i === 0,
                                            toggled: i === 0,
                                            name: path,
                                            path: treeNode.path + '$' + path,
                                            description: 'This library is bla, bla, bla..',
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
        }
    }

    onNodeLoad(nodeObj) {
        const client = this.props.gmeClient,
            childrenDesc = nodeObj.getValidChildrenTypesDetailed();

        // All children are meta-nodes -> thus available right away
        let validChildren = Object.keys(childrenDesc).map((id) => {
            let metaNode = client.getNode(id);
            return {
                id: metaNode.getId(),
                name: metaNode.getAttribute('shortName') || metaNode.getAttribute('name'),
                treePath: typeof this.props.treePathGetter === 'function' ? this.props.treePathGetter(metaNode) : null
                //active: childrenDesc[id]
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

    onTreeNodeToggle = (node, toggled) => {
        if (this.state.cursor) {
            this.state.cursor.active = false;
        }

        node.active = true;
        if (node.children) {
            node.toggled = toggled;
        }

        this.setState({cursor: node});
    };

    buildTreeStructure = (treeNode) => {
        if (treeNode.isFolder) {
            if (treeNode.isRoot) {
                return (
                    <ExpansionPanel key={treeNode.path} defaultExpanded>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            {treeNode.name}
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails style={{display: 'block', padding: 0, paddingBottom: 10}}>
                            <Treebeard data={treeNode}
                                       onToggle={this.onTreeNodeToggle}
                                       decorators={decorators}
                                       style={this.theme}/>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>);
            } else {
                return (
                    treeNode.children.sort(nameSort).map(this.buildTreeStructure)
                )
            }
        } else {
            return (
                <PartBrowserItem key={treeNode.id} treeNode={treeNode}/>
            )
        }
    };

    render() {
        if (!this.state.loaded) {
            return (<div>Loading node in Part Browser ...</div>);
        }

        return (
            <div style={{width: '100%'}}>
                {this.tree.children.map(this.buildTreeStructure)}
            </div>
        );
    }
}

PartBrowser.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    activeNode: PropTypes.string.isRequired,
    treePathGetter: PropTypes.func
};