// Libraries
import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Grid from 'material-ui/Grid';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import MenuIcon from 'material-ui-icons/Menu';
import AssignmentIcon from 'material-ui-icons/Assignment';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';

// Own modules
import PartBrowser from './PartBrowser';
import AttributeEditor from './AttributeEditor';
import Canvas from './Canvas';

class Project extends Component {
    state = {
        activeNode: null,
        branch: null,
        sideMenu: true,
        bottomMenu: true
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.gmeClient.selectProject(this.props.projectId, 'master', (err) => {
            if (err) {
                console.error(err);
                return;
            }

            console.log('selectedProject', this.props.projectId);
            this.setState({
                branch: this.props.gmeClient.getActiveBranchName(),
                activeNode: ''
            });
        });
    }

    onSideMenuOpen = () => {
        this.setState({sideMenu: true});
    };

    onSideMenuClose = () => {
        this.setState({sideMenu: false});
    };

    onBottomMenuOpen = () => {
        this.setState({bottomMenu: true});
    };

    onBottomMenuClose = () => {
        this.setState({bottomMenu: false});
    };

    render() {
        const {activeNode, branch} = this.state;
        const [owner, name] = this.props.projectId.split('+');

        if (typeof activeNode !== 'string') {
            return <div>Loading in project ...</div>;
        }

        return (
            <div style={{
                position: 'relative',
                display: 'flex',
                width: '100%',
                height: '100%'
            }}>
                <AppBar>
                    <Toolbar disableGutters={this.state.sideMenu}>
                        <IconButton color="contrast" aria-label="open side menu" onClick={this.onSideMenuOpen}>
                            <MenuIcon/>
                        </IconButton>
                        <Typography type="title" color="inherit" noWrap>
                            {`Branch ${branch} open for ${owner} / ${name}`}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer type="persistent" anchor="left" open={this.state.sideMenu} style={{width: 240}}>
                        <IconButton onClick={this.onSideMenuClose}>
                            <ChevronLeftIcon/>
                        </IconButton>
                    <div style={{maxWidth: 240}}>
                        <PartBrowser activeNode={activeNode} gmeClient={this.props.gmeClient}
                                     treePathGetter={(node) => {
                                         let modelicaUri = node.getAttribute('ModelicaURI');
                                         if (modelicaUri) {
                                             return modelicaUri.split('.').slice(1).join('$');
                                         }
                                     }}/>
                    </div>
                </Drawer>
                <div style={{marginTop: 64}}>
                    {this.state.bottomMenu ?
                        <Button onClick={this.onBottomMenuClose}>
                            HIDE ATTRIBUTES
                        </Button>
                        :
                        <Button onClick={this.onBottomMenuOpen}>
                            SHOW ATTRIBUTES
                        </Button>
                    }
                    <div style={{width: 400, height: 400, borderStyle: 'dotted'}}>
                    <Canvas activeNode={this.state.activeNode} gmeClient={this.props.gmeClient}/>
                    </div>
                </div>
                <Drawer type="persistent" anchor="bottom" open={this.state.bottomMenu} onClose={this.onBottomMenuClose}>
                    <AttributeEditor activeNode={activeNode} gmeClient={this.props.gmeClient}/>
                </Drawer>
            </div>
        );
    }
}

Project.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired
};

export default DragDropContext(HTML5Backend)(Project);