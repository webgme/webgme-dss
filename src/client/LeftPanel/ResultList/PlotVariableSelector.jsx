import React, {Component} from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import {connect} from 'react-redux';

import {Treebeard} from 'react-treebeard';
import {treeBeardTheme, getTreeDecorators} from 'webgme-react-components/src/components/PartBrowser/TreeOverrides';
import getObjectSorter from '../../gme/utils/getObjectSorter';
import PlotVariableSelectorItem from './PlotVariableSelectorItem';

import {addPlotVariable, removePlotVariable} from '../../actions';

const mapStateToProps = state => ({
    selectedVariables: state.plotData.variables,
    simRes: state.plotData.simRes,
});

const mapDispatchToProps = dispatch => ({
    addPlotVariable: (varName) => {
        dispatch(addPlotVariable(varName));
    },
    removePlotVariable: (varName) => {
        dispatch(removePlotVariable(varName));
    },
});

class PlotVariableSelector extends Component {
    static propTypes = {
        simRes: PropTypes.shape({
            variables: PropTypes.object,
        }).isRequired,
    };

    constructor(props) {
        super(props);

        this.decorators = getTreeDecorators(connect(mapStateToProps, mapDispatchToProps)(PlotVariableSelectorItem), {});
        this.treeNodes = this.getTreeNodes();
    }

    state = {
        cursor: null,
    };

    onTreeNodeToggle = (node, toggled) => {
        if (this.state.cursor) {
            // FIXME: This is modifying the state directly - however can we set the previous node
            // FIXME: to be deactivated with out modifying it?
            const oldCursor = this.state.cursor;
            oldCursor.active = false;
            // this.state.cursor.active = false;
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

    getTreeNodes() {
        const rootNode = {
            isRoot: true,
            toggled: true,
            name: 'root',
            isFolder: true,
            children: [],
            folders: {},
        };

        const {variables} = this.props.simRes;
        const sorter = getObjectSorter('sortName', true, true);


        Object.keys(variables).forEach((varName) => {
            let treeNode = rootNode;
            const isDer = varName.startsWith('der(');
            let fullPath = varName;

            if (isDer) {
                fullPath = varName.substr('der('.length).slice(0, -1);
            }

            fullPath.split('.').forEach((path, i, arr) => {
                if (i === arr.length - 1) {
                    treeNode.children.push(update(variables[varName], {
                        sortName: {$set: `:${path}`},
                        name: {$set: isDer ? `der( ${path} )` : path},
                        id: {$set: varName},
                    }));
                } else {
                    if (!treeNode.folders[path]) {
                        treeNode.folders[path] = {
                            isFolder: true,
                            sortName: path,
                            toggled: false,
                            name: path,
                            folders: {},
                            children: [],
                        };

                        treeNode.children.push(treeNode.folders[path]);
                    }

                    treeNode = treeNode.folders[path];
                }

                treeNode.children.sort(sorter);
            });
        });

        return rootNode;
    }

    render() {
        return (
            <Treebeard
                data={this.treeNodes}
                onToggle={this.onTreeNodeToggle}
                decorators={this.decorators}
                style={treeBeardTheme}
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PlotVariableSelector);
