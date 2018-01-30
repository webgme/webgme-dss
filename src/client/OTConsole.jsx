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
        attributeName: PropTypes.string.isRequired
    };

    state = {
        project: this.props.gmeClient.getProjectObject(),
        delta: new Delta(),
        attributeValue: null,
        docId: null
    };

    onTerritoryUpdate = (hash, loads, updates, unloads) => {
        const {nodeId, gmeClient, attributeName} = this.props,
            {delta, attributeValue} = this.state;
        let nodeObj, newState = {}, haveUpdated = false;

        if (loads.indexOf(nodeId) !== -1) {
            //initializing
            nodeObj = gmeClient.getNode(nodeId);
            newState.attributeValue = nodeObj.getAttribute(attributeName);
            newState.delta = delta.insert(newState.attributeValue);
            haveUpdated = true;
        } else if (updates.indexOf(nodeId) !== -1) {
            nodeObj = gmeClient.getNode(nodeId);
            newState.attributeValue = nodeObj.getAttribute(attributeName);
            if (newState.attributeValue !== attributeValue) {
                newState.delta = delta.delete(delta.length()).insert(newState.attributeValue);
                haveUpdated = true;
            }
        }

        if (haveUpdated) {
            this.setState(newState);
        }
    };

    atOperation = (operation) => {
        console.log(operation);
    };

    //TODO we need to transform this into operations if we want to support
    atSelection = (selection) => {
        console.log(selection);
    };

    componentWillMount() {
        const {nodeId, attributeName} = this.props,
            {project} = this.state,
            self = this;

        project.watchDocument({
            branchName: 'master',
            nodeId: nodeId,
            attrName: attributeName,
            attrValue: ''
        }, this.atOperation, this.atSelection)
            .then(function (initData) {
                self.setState({docId: initData.docId});
            });

    }

    componentWillUnmount() {
        const {project, docId} = this.state;
        project.unwatchDocument(docId);
    }

    render() {
        const {gmeClient} = this.props,
            {delta} = this.state;

        return (<div>
            <Territory gmeClient={gmeClient} onlyActualEvents={true} onUpdate={this.onTerritoryUpdate}/>
            <ReactQuill
                style={{
                    backgroundColor: '#002b36',
                    color: '#586e75',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }}
                theme={null}
                value={delta}
                readOnly={true}/>
        </div>);
    }
}