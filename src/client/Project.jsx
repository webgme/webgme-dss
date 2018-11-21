// Libraries
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import LinearProgress from '@material-ui/core/LinearProgress';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import EditMode from '@material-ui/icons/Edit';
import MultilineChart from '@material-ui/icons/MultilineChart';

import {PartBrowserDragPreview} from 'webgme-react-components/src/components/PartBrowser';

// Own modules
import {setActiveNode, setSystemWaiting, toggleModelingView, toggleLeftDrawer, toggleRightDrawer} from './actions';
import Header from './HeaderPanel/Header';
import CenterPanel from './CenterPanel/CenterPanel';
import LeftDrawer from './LeftPanel/LeftDrawer';
import RightDrawer from './RightPanel/RightDrawer';

// const SIDE_PANEL_WIDTH = 300;
// const HEADER_HEIGHT = 64;
const START_NODE_ID = '/Z'; // FIXME: This should come from the project info or root-node registry

const mapStateToProps = state => ({
    activeNode: state.activeNode,
    modelingView: state.modelingView,
    scale: state.scale,
});

const mapDispatchToProps = dispatch => ({
    setActiveNode: (id) => {
        dispatch(setActiveNode(id));
    },
    setSystemWaiting: (isWaiting) => {
        dispatch(setSystemWaiting(isWaiting));
    },
    toggleModelingView: (modeling) => {
        dispatch(toggleModelingView(modeling));
    },
    toggleLeftDrawer: (show) => {
        dispatch(toggleLeftDrawer(show));
    },
    toggleRightDrawer: (show) => {
        dispatch(toggleRightDrawer(show));
    },
});

class Project extends Component {
    static propTypes = {
        gmeClient: PropTypes.shape({
            selectProject: PropTypes.func.isRequired,
        }).isRequired,
        projectId: PropTypes.string.isRequired,
        activeNode: PropTypes.string,
        scale: PropTypes.number.isRequired,

        setSystemWaiting: PropTypes.func.isRequired,
        setActiveNode: PropTypes.func.isRequired,
        modelingView: PropTypes.bool.isRequired,
        toggleLeftDrawer: PropTypes.func.isRequired,
        toggleRightDrawer: PropTypes.func.isRequired,
        toggleModelingView: PropTypes.func.isRequired,
    };

    static defaultProps = {
        activeNode: null,
    };

    componentDidMount() {
        const {gmeClient, projectId} = this.props;

        gmeClient.selectProject(projectId, 'master', (err) => {
            if (err) {
                console.error(err);
                return;
            }

            this.props.setSystemWaiting(false);

            const tempUI = gmeClient.addUI(null, (events) => {
                let activeNode = ''; // Fall back on root-node

                for (let i = 0; i < events.length; i += 1) {
                    if (events[i].etype === 'load' && events[i].eid === START_NODE_ID) {
                        activeNode = START_NODE_ID;
                        break;
                    }
                }

                gmeClient.removeUI(tempUI);

                this.props.setActiveNode(activeNode);
            });

            const territory = {
                [START_NODE_ID]: {children: 0},
            };

            gmeClient.updateTerritory(tempUI, territory);
        });
    }

    componentWillUnmount() {
        const {gmeClient} = this.props;

        gmeClient.closeProject((err) => {
            if (err) {
                console.error(err);
            }
        });
    }

    render() {
        const {
            gmeClient, projectId, activeNode, modelingView, scale,
        } = this.props;

        const [owner, name] = projectId.split('+');

        let content;

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
                    height: '100%',
                }}
                >
                    <PartBrowserDragPreview scale={scale}/>

                    <Header gmeClient={gmeClient} projectOwner={owner} projectName={name} branchName="master"/>

                    <LeftDrawer gmeClient={gmeClient}/>

                    <CenterPanel gmeClient={gmeClient}/>

                    <RightDrawer gmeClient={gmeClient}/>

                    <BottomNavigation
                        value={modelingView ? 0 : 1}
                        onChange={(event, value) => {
                            if (value === 1) {
                                this.props.toggleLeftDrawer(true);
                                this.props.toggleRightDrawer(false);
                            }
                            this.props.toggleModelingView(value === 0);
                        }}
                        showLabels
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 'calc(50% - 100px)',
                            width: 200,
                            backgroundColor: 'transparent',
                            // opacity: 0.9,
                        }}
                    >
                        <BottomNavigationAction label="Modeling" icon={<EditMode/>} style={{opacity: 0.9}}/>
                        <BottomNavigationAction label="Results" icon={<MultilineChart/>} style={{opacity: 0.9}}/>
                    </BottomNavigation>
                </div>
            );
        }

        return content;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(Project));
