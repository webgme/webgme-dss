import React, {Component} from 'react';
import {connect} from 'react-redux';

import ReactQuill from 'react-quill';
import Delta from 'quill-delta';
import PropTypes from 'prop-types';

import './Console.css';
import Territory from './gme/BaseComponents/Territory';

const mapStateToProps = state => ({
    resultNode: state.resultNode,
});

const mapDispatchToProps = () => ({});

class OTConsole extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        attributeName: PropTypes.string.isRequired,

        resultNode: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        const {gmeClient} = this.props;

        this.state.project = gmeClient.getProjectObject();
    }

    state = {
        project: null,
        delta: new Delta(),
        document: null,
        attributeValue: null,
        docId: null,
        watcherId: null,
    };

    componentWillUnmount() {
        const {project, docId, watcherId} = this.state;
        if (project && docId) {
            project.unwatchDocument({docId, watcherId});
        }
    }

    onTerritoryUpdate = (hash, loads, updates/* , unloads */) => {
        const {resultNode, gmeClient, attributeName} = this.props;

        const {
            delta, attributeValue, document, project,
        } = this.state;

        const newState = {};
        let nodeObj;
        let haveUpdated = false;

        if (loads.indexOf(resultNode) !== -1) {
            // initializing
            nodeObj = gmeClient.getNode(resultNode);
            newState.attributeValue = nodeObj.getAttribute(attributeName);
            newState.delta = delta.insert(newState.attributeValue);
            if (document === null) {
                project.watchDocument({
                    branchName: 'master',
                    nodeId: resultNode,
                    attrName: attributeName,
                    attrValue: newState.attributeValue,
                }, this.atOperation, this.atSelection)
                    .then((initData) => {
                        this.setState({
                            docId: initData.docId,
                            document: initData.document,
                            watcherId: initData.watcherId,
                        });
                    });

                newState.document = newState.attributeValue;
            }

            haveUpdated = true;
        } else if (updates.indexOf(resultNode) !== -1) {
            nodeObj = gmeClient.getNode(resultNode);
            newState.attributeValue = nodeObj.getAttribute(attributeName);

            if (newState.attributeValue !== attributeValue) {
                newState.delta = delta.delete(delta.length()).insert(newState.attributeValue);
                newState.document = newState.attributeValue;
                haveUpdated = true;
            }
        }

        if (haveUpdated) {
            this.setState(newState);
        }
    };

    // TODO we should be able to have different color for the latest change
    atOperation = (operation) => {
        this.setState({document: operation.apply(this.state.document)});
    };

    // TODO we need to transform this into operations if we want to support
    atSelection = () => {
    };

    render() {
        const {gmeClient, resultNode} = this.props;
        const {document} = this.state;

        return (
            <div style={{backgroundColor: '#002b36', height: '100%', width: '100%'}}>
                {resultNode ? <Territory
                    gmeClient={gmeClient}
                    onlyActualEvents
                    onUpdate={this.onTerritoryUpdate}
                    territory={{[resultNode]: {children: 0}}}
                /> : <div/>}
                <ReactQuill
                    style={{
                        backgroundColor: '#002b36',
                        color: '#586e75',
                        fontSize: 12,
                        marginLeft: 300, // FIXME: These should not be here
                        height: 300,
                        fontFamily: 'monospace',
                    }}
                    theme={null}
                    value={document}
                    readOnly
                />
            </div>);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(OTConsole);
