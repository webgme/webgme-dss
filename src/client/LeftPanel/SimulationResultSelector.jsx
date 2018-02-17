import React, {Component} from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';
import {connect} from 'react-redux';

import Checkbox from 'material-ui/Checkbox';
import {
    FormControlLabel
} from 'material-ui/Form';
import {Treebeard} from 'react-treebeard';
import {treeBeardTheme, getTreeDecorators} from "../treeOverrides";
import getObjectSorter from '../gme/utils/getObjectSorter';

import {addPlotVariable, removePlotVariable} from '../actions';

const mapStateToProps = state => {
    return {
        selectedVariables: state.plotData.variables,
        simRes: state.plotData.simRes
    }
};

const mapDispatchToProps = dispatch => {
    return {
        addPlotVariable: varName => {
            dispatch(addPlotVariable(varName));
        },
        removePlotVariable: varName => {
            dispatch(removePlotVariable(varName));
        }
    }
};

class LeafNode extends Component {
    static propTypes = {
        nodeData: PropTypes.object.isRequired
    };

    onSelectVariable = (event, checked) => {
        const {nodeData, addPlotVariable, removePlotVariable} = this.props;

        if (checked) {
            addPlotVariable(nodeData.id);
        } else {
            removePlotVariable(nodeData.id);
        }
    };

    render() {
        const {nodeData, selectedVariables} = this.props;
        const varName = nodeData.name;
        const isChecked = selectedVariables.includes(nodeData.id);

        // TODO: Style me
        return (<FormControlLabel style={{height: 28}} control={
            <Checkbox
                style={{height: 30}}
                checked={isChecked}
                onChange={this.onSelectVariable}
                value={varName}/>
        }
                                  label={varName}
        />);
    }
}

class SimulationResultSelector extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired
    };

    state = {
        cursor: null
    };

    constructor(/*props*/) {
        super();

        const {simRes} = this.props;

        this.decorators = getTreeDecorators(connect(mapStateToProps, mapDispatchToProps)(LeafNode), {});
        this.treeNodes = this.getTreeNodes(simRes.variables);
    }

    getTreeNodes(variables) {
        let rootNode = {
            isRoot: true,
            toggled: true,
            name: 'root',
            isFolder: true,
            children: [],
            folders: {}
        };

        const sorter = getObjectSorter('sortName', true, true);

        Object.keys(variables).forEach(varName => {
            let treeNode = rootNode;
            let isDer = varName.startsWith('der(');
            let fullPath = varName;

            if (isDer) {
                fullPath = varName.substr('der('.length).slice(0, -1);
            }

            fullPath.split('.').forEach((path, i, arr) => {
                if (i === arr.length - 1) {
                    treeNode.children.push(update(variables[varName], {
                        sortName: {$set: ':' + path},
                        name: {$set: isDer ? `der( ${path} )` : path},
                        id: {$set: varName}
                    }));
                } else {
                    if (!treeNode.folders[path]) {
                        treeNode.folders[path] = {
                            isFolder: true,
                            sortName: path,
                            toggled: false,
                            name: path,
                            folders: {},
                            children: []
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

    onTreeNodeToggle = (node, toggled) => {
        if (this.state.cursor) {
            // FIXME: This is modifying the state directly - however can we set the previous node
            // FIXME: to be deactivated with out modifying it?
            let oldCursor = this.state.cursor;
            oldCursor.active = false;
            // this.state.cursor.active = false;
        }

        node.active = true;
        if (node.children) {
            node.toggled = toggled;
            if (node.children.length === 1 && node.children[0].isFolder) {
                node.children[0].toggled = true;
            }
        }

        this.setState({cursor: node});
    };

    render() {
        return (
            <Treebeard data={this.treeNodes}
                       onToggle={this.onTreeNodeToggle}
                       decorators={this.decorators}
                       style={treeBeardTheme}
            />
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SimulationResultSelector);