import React, {Component} from 'react';
import ReactQuill from 'react-quill';
import Delta from 'quill-delta';
import PropTypes from 'prop-types';

import './Console.css';
import Territory from "./gme/BaseComponents/Territory";

export default class OTConsole extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        nodeId: PropTypes.string.isRequired,
        attributeName: PropTypes.string.isRequired,
        onTest: PropTypes.func
    };

    state = {
        project: this.props.gmeClient.getProjectObject(),
        delta: new Delta(),
        document: null,
        attributeValue: null,
        docId: null
    };

    onTerritoryUpdate = (hash, loads, updates, unloads) => {
        const {nodeId, gmeClient, attributeName, onTest} = this.props,
            {delta, attributeValue, document, project} = this.state,
            self = this;
        let nodeObj, newState = {}, haveUpdated = false;

        if (loads.indexOf(nodeId) !== -1) {
            //initializing
            nodeObj = gmeClient.getNode(nodeId);
            newState.attributeValue = nodeObj.getAttribute(attributeName);
            newState.delta = delta.insert(newState.attributeValue);
            if (document === null) {
                project.watchDocument({
                    branchName: 'master',
                    nodeId: nodeId,
                    attrName: attributeName,
                    attrValue: newState.attributeValue
                }, this.atOperation, this.atSelection)
                    .then(function (initData) {
                        if (onTest)
                            onTest(initData);
                        self.setState({docId: initData.docId, document: initData.document});
                    });

                newState.document = newState.attributeValue;
            }
            haveUpdated = true;
        } else if (updates.indexOf(nodeId) !== -1) {
            nodeObj = gmeClient.getNode(nodeId);
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

    //TODO we should be able to have different color for the latest change
    atOperation = (operation) => {
        this.setState({document: operation.apply(this.state.document)});
    };

    //TODO we need to transform this into operations if we want to support
    atSelection = (selection) => {
    };

    componentWillUnmount() {
        const {project, docId} = this.state;
        project.unwatchDocument({docId: docId});
    }

    render() {
        const {gmeClient, nodeId} = this.props,
            {document} = this.state;
        let territory = {};
        territory[nodeId] = {children: 0};

        return (<div style={{backgroundColor: '#002b36', height: '100%', width: '100%'}}>
            <Territory gmeClient={gmeClient} onlyActualEvents={true} onUpdate={this.onTerritoryUpdate}
                       territory={territory}/>
            <ReactQuill
                style={{
                    backgroundColor: '#002b36',
                    color: '#586e75',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }}
                theme={null}
                value={document}
                readOnly={true}/>
        </div>);
    }
}