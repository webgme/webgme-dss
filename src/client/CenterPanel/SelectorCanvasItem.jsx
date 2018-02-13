import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Samy} from 'react-samy-svg';

import Territory from '../gme/BaseComponents/Territory';
import BasicConnection from './BasicConnection';
import SVGCACHE from './../../svgcache';
import colorHash from '../gme/utils/colorHash';

const mapStateToProps = state => {
    return {
        scale: state.scale,
        variables: state.plotData.variables
    }
};

const mapDispatchToProps = dispatch => {
    return {};
};

class SelectorCanvasItem extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        activeNode: PropTypes.string.isRequired, // This is not the same as the state.activeNode..
        scale: PropTypes.number.isRequired,
        contextNode: PropTypes.string.isRequired,
        eventManager: PropTypes.object.isRequired
    };

    //TODO we need to gather the children info (new base class maybe)
    state = {
        position: null,
        name: null,
        showActions: false,
        modelicaUri: 'Default',
        childrenName2Id: {},
        childInfo: {},
        isConnection: null,
        currentRootHash: null,
        endPoints: {src: {id: null}, dst: {id: null}},
        territory: null,
        justRemovedIds: []
    };

    onClick = (targetId) => {
        //TODO right now we will not control the selection from the canvas
        /*
        let {selectedIds} = this.state;

        if (selectedIds.indexOf(targetId) !== -1) {
            selectedIds.splice(selectedIds.indexOf(targetId), 1);
        } else {
            selectedIds.push(targetId);
        }
        this.setState({selectedIds: selectedIds});
        */
    };

    isSelected = (myId) => {
        // return this.state.selectedIds.indexOf(myId) !== -1;
        const {gmeClient, variables, activeNode} = this.props,
            node = gmeClient.getNode(myId),
            hostNode = gmeClient.getNode(activeNode);
        let variablePrefix;

        if (myId === activeNode) {
            variablePrefix = hostNode.getAttribute('name') + '.';
        } else {
            variablePrefix = hostNode.getAttribute('name') + '.' + node.getAttribute('name') + '.';
        }

        for (let i = 0; i < variables.length; i += 1) {
            if (variables[i].startsWith(variablePrefix))
                return true;
        }

        return false;
    };

    getSelectionItems = (nodeId, opacity) => {
        const {gmeClient, variables, activeNode} = this.props,
            node = gmeClient.getNode(nodeId),
            hostNode = gmeClient.getNode(activeNode);
        let variablePrefix, matches;

        if (nodeId === activeNode) {
            variablePrefix = hostNode.getAttribute('name');
        } else {
            variablePrefix = hostNode.getAttribute('name') + '.' + node.getAttribute('name');
        }

        matches = variables.filter(variable => variable.substring(
            Math.max(0, variable.indexOf('(') + 1), variable.lastIndexOf('.')) === variablePrefix);

        return matches.map((variable, index) => {
            const step = 100 / matches.length;

            return (
                <div style={{
                    top: (index * step) + '%',
                    width: '100%',
                    height: step + '%',
                    opacity: opacity || 0.5,
                    position: 'absolute',
                    backgroundColor: colorHash(variable).rgb
                }}/>
            )
        })
    };

    componentDidMount() {
        let territory = {};
        territory[this.props.activeNode] = {children: 0};

        this.setState({territory: territory});
    }

    deleteNode = () => {
        this.props.gmeClient.deleteNode(this.props.activeNode);
    };

    srcEvent = (id, event) => {
        const {position} = this.state.endPoints.src;

        if (id !== this.state.endPoints.src.id)
            return;
        if (event.position === null || position === null ||
            event.position.x !== position.x || event.position.y !== position.y) {
            let endPoints = this.state.endPoints;
            endPoints.src.position = event.position;
            this.setState({endPoints: endPoints});
        }
    };

    dstEvent = (id, event) => {
        const {position} = this.state.endPoints.dst;
        if (id !== this.state.endPoints.dst.id)
            return;
        if (event.position === null || position === null ||
            event.position.x !== position.x || event.position.y !== position.y) {
            let endPoints = this.state.endPoints;
            endPoints.dst.position = event.position;
            this.setState({endPoints: endPoints});
        }
    };

    getChildInfo = (childNode) => {
        const {gmeClient} = this.props,
            metaNodes = gmeClient.getAllMetaNodes(true);
        let info = {name: childNode.getAttribute('name'), validConnection: {}};
        for (let path in metaNodes) {
            if (childNode.isValidTargetOf(path, 'src'))
                info.validConnection.src = path;
            if (childNode.isValidTargetOf(path, 'dst'))
                info.validConnection.dst = path;
        }

        return info;
    };

    territoryUpdates = (hash, loads, updates, unloads) => {
        const {activeNode, gmeClient, eventManager} = this.props,
            {endPoints} = this.state;

        // console.log('event-', hash, loads, updates, unloads);
        if (unloads.indexOf(activeNode) !== -1) {
            //main object have been unloaded so remove everything...
            let endPoints = this.state.endPoints;

            if (endPoints.src.event) {
                eventManager.unsubscribe(endPoints.src.id, endPoints.src.event);
            }
            if (endPoints.dst.event) {
                eventManager.unsubscribe(endPoints.dst.id, endPoints.dst.event);
            }

            this.setState({
                position: null,
                name: null,
                showActions: false,
                modelicaUri: 'Default',
                childrenName2Id: {},
                childInfo: {},
                isConnection: null,
                currentRootHash: null,
                endPoints: {src: {id: null}, dst: {id: null}},
                territory: null,
                justRemovedIds: []
            });
            return;
        }

        let nodeObj = gmeClient.getNode(activeNode),
            metaNode = gmeClient.getNode(nodeObj.getMetaTypeId()),
            validPointers = nodeObj.getValidPointerNames(),
            isConnection = validPointers.indexOf('src') !== -1 && validPointers.indexOf('dst') !== -1,
            newEndpoints = null,
            modelicaUri = 'Default',
            territory = {},
            childrenPaths = nodeObj.getChildrenIds(),
            childrenName2Id = {},
            childInfo = {};

        if (isConnection) {
            newEndpoints = {
                src: {id: nodeObj.getPointerId('src'), position: null, event: this.srcEvent},
                dst: {id: nodeObj.getPointerId('dst'), position: null, event: this.dstEvent}
            };

            if (endPoints.src.id !== newEndpoints.src.id || endPoints.dst.id !== newEndpoints.dst.id) {
                //subscription to events
                let event;

                event = eventManager.subscribe(newEndpoints.src.id, newEndpoints.src.event);
                if (event) {
                    newEndpoints.src.position = event.position;
                }
                event = eventManager.subscribe(newEndpoints.dst.id, newEndpoints.dst.event);
                if (event) {
                    newEndpoints.dst.position = event.position;
                }
            } else {
                newEndpoints = endPoints;
            }
            territory[activeNode] = {children: 0};

        } else {
            newEndpoints = endPoints;
            childrenName2Id = this.state.childrenName2Id;
            childInfo = this.state.childInfo;
            modelicaUri = metaNode.getAttribute('ModelicaURI') || 'Default';
            childrenPaths.forEach((childPath) => {
                if (loads.indexOf(childPath) !== -1 || updates.indexOf(childPath) !== -1) {
                    let childNode = gmeClient.getNode(childPath);
                    childrenName2Id[childNode.getAttribute('name')] = childPath;
                    childInfo[childPath] = this.getChildInfo(childNode);
                } else if (unloads.indexOf(childPath) !== -1) {
                    let name;
                    for (name in childrenName2Id) {
                        if (childrenName2Id[name] === childPath) {
                            delete childrenName2Id[name];
                            delete childInfo[childPath];
                        }
                    }
                }
            });
            territory[activeNode] = {children: 1};
        }

        this.setState({
            position: nodeObj.getRegistry('position'),
            name: nodeObj.getAttribute('name'),
            modelicaUri: modelicaUri,
            isConnection: isConnection,
            endPoints: newEndpoints,
            childrenName2Id: childrenName2Id,
            childInfo: childInfo,
            territory: territory,
            justRemovedIds: unloads
        });
    };

    getAttributeItems = () => {
        const {gmeClient, activeNode, scale} = this.props,
            {modelicaUri} = this.state,
            {attributes} = SVGCACHE[modelicaUri];
        let node = gmeClient.getNode(activeNode),
            attributeItems = [];

        if (node === null)
            return null;
        for (let key in attributes) {
            attributeItems.push(<svg
                key={key}
                style={{
                    position: 'absolute',
                    top: attributes[key].bbox.y * scale,
                    left: attributes[key].bbox.x * scale
                }}
                viewBox={'' + (attributes[key].bbox.x * scale) + ' ' + (attributes[key].bbox.y * scale) +
                ' ' + ((attributes[key].bbox.x + attributes[key].bbox.width) * scale) +
                ' ' + ((attributes[key].bbox.y + attributes[key].bbox.height) * scale)}>
                <text
                    x={(attributes[key].parameters.x || 0) * scale}
                    y={(attributes[key].parameters.y || 0) * scale}
                    alignmentBaseline={attributes[key].parameters['alignment-baseline'] || 'middle'}
                    fill={attributes[key].parameters.fill || 'rgb(0,0,255)'}
                    fontFamily={attributes[key].parameters['font-family'] || 'Veranda'}
                    fontSize={Number(attributes[key].parameters['font-size'] || '18') * scale}
                    textAnchor={attributes[key].parameters['text-anchor'] || 'middle'}
                >{attributes[key].text.substring(0, attributes[key].position) +
                node.getAttribute(key) +
                attributes[key].text.substring(attributes[key].position)}</text>
            </svg>)
        }

        return attributeItems;
    };

    boxRender = () => {
        const {
                scale,
                eventManager,
                activeNode
            } = this.props,
            {
                modelicaUri,
                position,
                childrenName2Id,
                justRemovedIds
            } = this.state,
            {ports, bbox, base} = SVGCACHE[modelicaUri];
        let portComponents = [],
            keys,
            events = [];

        justRemovedIds.forEach((removedId) => {
            events.push({id: removedId, position: null});
        });

        keys = Object.keys(ports);
        keys.forEach((key) => {
            let id = childrenName2Id[key],
                port = ports[key];
            if (id) {
                portComponents.push((
                    <div key={id}
                         style={{
                             position: 'absolute',
                             left: scale * port.x - 2,
                             top: scale * port.y - 2,
                             width: scale * port.width + 4,
                             height: scale * port.height + 4,
                         }}
                         onClick={(event) => {
                             event.stopPropagation();
                             event.preventDefault();
                             this.onClick(id);
                         }}>
                        {this.getSelectionItems(id, 1)}
                    </div>
                ));

                events.push({
                    id: id,
                    position: {
                        x: position.x * scale + (scale * (port.x + (port.width / 2))),
                        y: position.y * scale + (scale * (port.y + (port.height / 2)))
                    }
                });
            }
        });

        events.forEach((event) => {
            eventManager.fire(event.id, {position: event.position});
        });

        return (<div style={{
            position: 'absolute',
            top: position.y * scale,
            left: position.x * scale,
            height: bbox.height * scale,
            width: bbox.width * scale,
            zIndex: 10
        }}
                     onClick={(event) => {
                         event.stopPropagation();
                         event.preventDefault();
                         this.onClick(activeNode);
                     }}>
            {this.getSelectionItems(activeNode)}
            {portComponents}
            <Samy svgXML={base}
                  style={{
                      height: bbox.height * scale,
                      width: bbox.width * scale
                  }}/>
            {this.getAttributeItems()}
        </div>);
    }
    ;

    connectionRender = () => {
        const {endPoints, showActions} = this.state,
            {activeNode} = this.props;
        let points;

        if (endPoints.src.position && endPoints.dst.position) {
            points = [endPoints.src.position, {
                x: endPoints.src.position.x,
                y: endPoints.dst.position.y
            }, endPoints.dst.position];

            return (<BasicConnection
                key={activeNode}
                path={points}
                dashed={showActions}
                hasWrapper={false}/>);
        }

        return null;
    };

    render() {
        const {activeNode, gmeClient} = this.props,
            {territory, isConnection} = this.state;
        let content;

        switch (isConnection) {
            case true:
                content = this.connectionRender();
                break;
            case false:
                content = this.boxRender();
                break;
            default:
                content = null;
        }

        return (<div>
            <Territory
                key={activeNode + '_territory'}
                activeNode={activeNode}
                gmeClient={gmeClient}
                territory={territory}
                onlyActualEvents={true}
                onUpdate={this.territoryUpdates}/>
            {content}
        </div>);
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(SelectorCanvasItem);