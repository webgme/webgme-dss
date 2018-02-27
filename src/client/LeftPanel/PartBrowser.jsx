// https://github.com/alexcurtis/react-treebeard
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import ExpansionPanel, {ExpansionPanelDetails, ExpansionPanelSummary} from 'material-ui/ExpansionPanel';
import ExpandMoreIcon from 'material-ui-icons/ExpandMore';
import {withTheme} from 'material-ui/styles';
import Typography from 'material-ui/Typography';
import {Treebeard} from 'react-treebeard';

import SingleConnectedNode from '../gme/BaseComponents/SingleConnectedNode';
import {nameSort} from '../gme/utils/getObjectSorter';

import PartBrowserItem from './PartBrowserItem';
import {treeBeardTheme, getTreeDecorators} from '../treeOverrides';

const TREE_PATH_SEP = '$';
const EXPAND_ALL = false;

const mapStateToProps = state => ({
    activeNode: state.activeNode,
    scale: state.scale,
});

class PartBrowser extends SingleConnectedNode {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,

        activeNode: PropTypes.string.isRequired,
        scale: PropTypes.number.isRequired,

        minimized: PropTypes.bool.isRequired,
    };

    state = {
        loaded: false,
        validChildren: [],
        cursor: null,
    };

    constructor(props) {
        super(props);
        const {scale} = this.props;

        this.tree = {};
        this.items = [];
        this.decorators = getTreeDecorators(PartBrowserItem, {scale});
    }

    componentWillUpdate(nextProps, nextState) {
        // TODO: Revise this check when/if incremental updates to validChildren will be done.
        const {validChildren} = nextState;
        if (validChildren !== this.state.validChildren) {
            // Build up a new tree structure.
            this.tree = {children: [], folders: {}, path: 'ROOT'};

            validChildren
                .forEach((childDesc) => {
                    let treeNode = this.tree;
                    this.items.push(childDesc);

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
                                            toggled: EXPAND_ALL || i === 0,
                                            name: path,
                                            path: `${treeNode.path}$${path}`,
                                            description: 'TODO: Fetch info',
                                            folders: {},
                                            children: [],
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

    updateValidChildren(validChildrenMap) {
        const {gmeClient} = this.props;
        const validChildren = Object.keys(validChildrenMap).map((id) => {
            const metaNode = gmeClient.getNode(id);
            const modelicaUri = metaNode.getAttribute('ModelicaURI');

            return {
                id: metaNode.getId(),
                name: metaNode.getAttribute('ShortName') || metaNode.getAttribute('name'),
                treePath: modelicaUri ? modelicaUri.split('.').slice(1).join('$') : null,
                modelicaUri: modelicaUri || 'Default',
                iconUrl: modelicaUri ? `/assets/DecoratorSVG/${modelicaUri}.svg` : '/assets/DecoratorSVG/Default.svg',
            };
        });

        this.setState({
            loaded: true,
            validChildren,
            validChildrenMap,
        });
    }

    onNodeLoad(nodeObj) {
        this.updateValidChildren(nodeObj.getValidChildrenTypesDetailed());
    }

    onNodeUpdate(nodeObj) {
        const newValidChildrenMap = nodeObj.getValidChildrenTypesDetailed();
        const currentValidChildrenMap = this.state.validChildren;
        const [newIds, prevIds] = [newValidChildrenMap, currentValidChildrenMap].map(Object.keys);

        if (newIds.length !== prevIds.length) {
            this.updateValidChildren(newValidChildrenMap);
        } else {
            for (let i = 0; i < newValidChildrenMap.length; i += 1) {
                if (typeof currentValidChildrenMap[newValidChildrenMap[i]] !== 'string') {
                    this.updateValidChildren(newValidChildrenMap);
                    break;
                }
            }
        }
    }

    onStateChanged() {
        const {gmeClient, activeNode} = this.props;

        if (this.state.loaded) {
            this.onNodeUpdate(gmeClient.getNode(activeNode));
        }
    }

    onNodeUnload() {
        this.setState({validChildren: []});
    }

    onTreeNodeToggle = (node, toggled) => {
        if (this.state.cursor) {
            this.state.cursor.active = false;
        }

        /* eslint-disable */
        node.active = true;
        if (node.children) {
            node.toggled = toggled;
            if (node.children.length === 1 && node.children[0].isFolder) {
                node.children[0].toggled = true;
            }
        }
        /* eslint-enable */

        this.setState({cursor: node});
    };

    buildTreeStructure = (treeNode) => {
        const {scale} = this.props;

        if (treeNode.isFolder) {
            if (treeNode.isRoot) {
                return (
                    <ExpansionPanel key={treeNode.path} defaultExpanded>
                        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography variant="subheading">{treeNode.name}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails style={{display: 'block', padding: 0, paddingBottom: 10}}>
                            <Treebeard
                                data={treeNode}
                                onToggle={this.onTreeNodeToggle}
                                decorators={this.decorators}
                                style={treeBeardTheme}
                            />
                        </ExpansionPanelDetails>
                    </ExpansionPanel>);
            }
            return (
                treeNode.children.sort(nameSort).map(this.buildTreeStructure)
            );
        }
        return (
            <PartBrowserItem key={treeNode.id} nodeData={treeNode} scale={scale}/>
        );
    };

    render() {
        const {minimized, scale} = this.props;
        let cnt = 0;

        if (!this.state.loaded) {
            return null;
        }

        return (
            <div style={{width: '100%', textAlign: minimized ? 'center' : undefined}}>
                <div style={{display: minimized ? 'none' : undefined}}>
                    {this.tree.children.map(this.buildTreeStructure)}
                </div>
                <div style={{display: minimized ? undefined : 'none'}}>
                    {this.items
                        .filter((/* child */) => {
                            // TODO: These should be filtered based on recent components used..
                            cnt += 1;
                            return cnt <= 10;
                        })
                        .map(child => (<PartBrowserItem
                            key={child.id}
                            nodeData={child}
                            scale={scale}
                            listView
                        />))
                    }
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps)(withTheme()(PartBrowser));
