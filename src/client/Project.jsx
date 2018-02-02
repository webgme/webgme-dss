// Libraries
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import {LinearProgress} from 'material-ui/Progress';

// Own modules
import {setActiveNode, setSystemWaiting} from "./actions";

import PartBrowserDragPreview from './LeftPanel/PartBrowserDragPreview';
import Header from './HeaderPanel/Header';
import CenterPanel from './CenterPanel/CenterPanel';
import LeftDrawer from './LeftPanel/LeftDrawer';
import RightDrawer from './RightPanel/RightDrawer';

// const SIDE_PANEL_WIDTH = 300;
// const HEADER_HEIGHT = 64;
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
        },
        setSystemWaiting: isWaiting => {
            dispatch(setSystemWaiting(isWaiting))
        }
    }
};

class Project extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        projectId: PropTypes.string.isRequired
    };

    state = {
        scale: 0.6
    };

    componentDidMount() {
        const {gmeClient, setActiveNode, setSystemWaiting} = this.props;

        gmeClient.selectProject(this.props.projectId, 'master', (err) => {
            if (err) {
                console.error(err);
                return;
            }

            setSystemWaiting(false);

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

    render() {
        let content;
        const {gmeClient, projectId, activeNode} = this.props;
        const {scale} = this.state;
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

                    <LeftDrawer gmeClient={gmeClient}/>

                    <CenterPanel gmeClient={gmeClient}/>

                    <RightDrawer gmeClient={gmeClient}/>
                </div>
            );
        }

        return content;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DragDropContext(HTML5Backend)(Project));