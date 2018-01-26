// Libraries
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {LinearProgress} from 'material-ui/Progress';
import {withStyles} from 'material-ui/styles';

// Own modules
import PartBrowserDragPreview from './PartBrowserDragPreview';
import Header from './Header';
import Canvas from './Canvas';
import LeftDrawer from './LeftDrawer';
import RightDrawer from './RightDrawer';

const SIDE_PANEL_WIDTH = 300;
const HEADER_HEIGHT = 64;
const START_NODE_ID = '/Z'; // FIXME: This should come from the project info or root-node registry

const styles = theme => ({
    root: {
        width: '100%',
        height: 430,
        marginTop: theme.spacing.unit * 3,
        zIndex: 1,
        overflow: 'hidden',
    },
    appFrame: {
        position: 'relative',
        display: 'flex',
        width: '100%',
        height: '100%',
    },
    appBar: {
        position: 'absolute',
        width: `calc(100% - ${SIDE_PANEL_WIDTH}px)`,
    },
    drawerPaper: {
        width: SIDE_PANEL_WIDTH,
        overflow: 'auto',
        top: HEADER_HEIGHT
    },
    drawerHeader: theme.mixins.toolbar,
    content: {
        backgroundColor: theme.palette.background.default,
        width: '100%',
        padding: theme.spacing.unit * 3,
        height: 'calc(100% - 56px)',
        marginTop: 56,
        [theme.breakpoints.up('sm')]: {
            height: 'calc(100% - 64px)',
            marginTop: 64,
        },
    },
});

class Project extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        projectId: PropTypes.string.isRequired,
        classes: PropTypes.object.isRequired
    };

    state = {
        activeNode: null,
        branch: null,
        leftMenu: true,
        rightMenu: false,
        modelView: true,
        selection: [],
        scale: 0.6,
        scrollPos: {x: 0, y: 0}
    };

    componentDidMount() {
        const client = this.props.gmeClient;

        client.selectProject(this.props.projectId, 'master', (err) => {
            if (err) {
                console.error(err);
                return;
            }

            const tempUI = client.addUI(null, (events) => {
                let activeNode = ''; // Fall back on root-node

                for (let i = 0; i < events.length; i += 1) {
                    if (events[i].etype === 'load' && events[i].eid === START_NODE_ID) {
                        activeNode = START_NODE_ID;
                        break;
                    }
                }

                client.removeUI(tempUI);

                this.setState({
                    branch: this.props.gmeClient.getActiveBranchName(),
                    activeNode
                });
            });

            const territory = {
                [START_NODE_ID]: {children: 0}
            };

            client.updateTerritory(tempUI, territory);
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
        this.setState({rightMenu: true, selection: [nodeId]});
    };

    onAttributeDrawerClose = () => {
        if (this.attributeDrawerTimerId) {
            clearTimeout(this.attributeDrawerTimerId);
            this.attributeDrawerTimerId = null;
        }
        this.setState({rightMenu: false});
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
        const {gmeClient, projectId} = this.props;
        const {activeNode, branch, selection, rightMenu, scale, leftMenu, scrollPos} = this.state;
        const [owner, name] = projectId.split('+');

        if (typeof activeNode !== 'string') {
            return (
                <div style={{position: 'absolute', top: '50%', width: '100%'}}>
                    <LinearProgress/>
                    <br/>
                    <LinearProgress color="secondary"/>
                    <br/>
                    <LinearProgress/>
                </div>);
        }

        return (
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%'
            }}>
                <PartBrowserDragPreview scale={scale}/>
                <Header gmeClient={gmeClient} owner={owner} projectName={name} branchName={branch}/>
                <LeftDrawer activeNode={activeNode} gmeClient={gmeClient} scale={scale} open={leftMenu}/>

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
                <RightDrawer selection={selection} gmeClient={gmeClient} scale={scale} open={rightMenu}/>
            </div>
        );
    }
}

export default withStyles(styles)(DragDropContext(HTML5Backend)(Project));