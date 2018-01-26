// Libraries
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {LinearProgress} from 'material-ui/Progress';

// Own modules
import {setActiveNode} from "./actions";

import PartBrowserDragPreview from './PartBrowserDragPreview';
import Header from './Header';
import Canvas from './Canvas';
import LeftDrawer from './LeftDrawer';
import RightDrawer from './RightDrawer';

const SIDE_PANEL_WIDTH = 300;
const HEADER_HEIGHT = 64;
const START_NODE_ID = '/Z'; // FIXME: This should come from the project info or root-node registry

const mapStateToProps = state => {
    return {
        activeNode: state.activeNode
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setActiveNode: id => {
            dispatch(setActiveNode(id))
        }
    }
};

class Project extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        projectId: PropTypes.string.isRequired
    };

    state = {
        leftDrawer: true,
        rightDrawer: false,
        modelView: true,
        selection: [],
        scale: 0.6,
        scrollPos: {x: 0, y: 0}
    };

    componentDidMount() {
        const {gmeClient, setActiveNode} = this.props;

        gmeClient.selectProject(this.props.projectId, 'master', (err) => {
            if (err) {
                console.error(err);
                return;
            }

            const tempUI = gmeClient.addUI(null, (events) => {
                let activeNode = ''; // Fall back on root-node

                for (let i = 0; i < events.length; i += 1) {
                    if (events[i].etype === 'load' && events[i].eid === START_NODE_ID) {
                        activeNode = START_NODE_ID;
                        break;
                    }
                }

                gmeClient.removeUI(tempUI);

                setActiveNode(activeNode);
            });

            const territory = {
                [START_NODE_ID]: {children: 0}
            };

            gmeClient.updateTerritory(tempUI, territory);
        });
    }

    componentWillUnmount() {
        // FIXME: Client needs a closeProject method!
    }

    onScroll = (event) => {
        this.setState({scrollPos: {x: event.target.scrollLeft, y: event.target.scrollTop}});
    };

    // Attribute drawer functionality
    attributeDrawerTimerId = null;

    activateAttributeDrawer = (nodeId) => {
        if (this.attributeDrawerTimerId) {
            clearTimeout(this.attributeDrawerTimerId);
            this.attributeDrawerTimerId = null;
        }
        this.attributeDrawerTimerId = setTimeout(this.onAttributeDrawerClose, 5000);
        this.setState({rightDrawer: true, selection: [nodeId]});
    };

    onAttributeDrawerClose = () => {
        if (this.attributeDrawerTimerId) {
            clearTimeout(this.attributeDrawerTimerId);
            this.attributeDrawerTimerId = null;
        }
        this.setState({rightDrawer: false});
    };

    //TODO this should be handled on the AttributeEditor level, so maybe a single
    //     property with onAutoClose should be enough...
    onAttributeDrawerAction = () => {
        if (this.attributeDrawerTimerId) {
            clearTimeout(this.attributeDrawerTimerId);
            this.attributeDrawerTimerId = null;
        }
        this.attributeDrawerTimerId = setTimeout(this.onAttributeDrawerClose, 5000);
    };

    render() {
        let content;
        const {gmeClient, projectId, activeNode} = this.props;
        const {selection, rightDrawer, scale, scrollPos} = this.state;
        const [owner, name] = projectId.split('+');

        if (typeof activeNode !== 'string') {
            content = (
                <div style={{position: 'absolute', top: '50%', width: '100%'}}>
                    <LinearProgress/>
                    <br/>
                    <LinearProgress color="secondary"/>
                    <br/>
                    <LinearProgress/>
                </div>);
        } else {
            content = (
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%'
                }}>
                    <PartBrowserDragPreview scale={scale}/>
                    <Header gmeClient={gmeClient} projectOwner={owner} projectName={name} branchName={'master'}/>
                    <LeftDrawer activeNode={activeNode} gmeClient={gmeClient}/>

                    {/*TODO: Move this to center panel*/}
                    <div onScroll={this.onScroll}
                         style={{
                             top: 0,
                             left: 0,
                             width: '100%',
                             height: '100vh',
                             position: 'absolute',
                             overflow: 'auto'
                         }}>
                        <Canvas activeNode={activeNode} gmeClient={gmeClient}
                                scrollPos={scrollPos} scale={scale}
                                activateAttributeDrawer={this.activateAttributeDrawer}/>
                    </div>
                    <RightDrawer selection={selection} gmeClient={gmeClient} scale={scale} open={rightDrawer}/>
                </div>
            );
        }

        return content;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(Project));