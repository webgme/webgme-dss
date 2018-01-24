// Libraries
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import MenuIcon from 'material-ui-icons/Menu';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import {LinearProgress} from 'material-ui/Progress';
import { withStyles } from 'material-ui/styles';

// Own modules
import PartBrowser from './PartBrowser';
import PartBrowserDragPreview from './PartBrowserDragPreview';
import AttributeEditor from './AttributeEditor';
import Canvas from './Canvas';
import PluginConfigDialog from './PluginConfigDialog';

const SIDE_PANEL_WIDTH = 300;
const HEADER_HEIGHT = 64;
const START_NODE_ID = '/Z'; // FIXME: This should come from the project info or root-node registry

var testConfig = [
    {
        "name": "species",
        "displayName": "Animal Species",
        "regex": "^[a-zA-Z]+$",
        "regexMessage": "Name can only contain English characters!",
        "description": "Which species does the animal belong to.",
        "value": "Horse",
        "valueType": "string",
        "readOnly": false
    },
    {
        "name": "age",
        "displayName": "Age",
        "description": "How old is the animal.",
        "value": 3,
        "valueType": "number",
        "minValue": 0,
        "maxValue": 10000,
        "readOnly": false,
        "writeAccessRequired": true
    },
    {
        "name": "carnivore",
        "displayName": "Carnivore",
        "description": "Does the animal eat other animals?",
        "value": false,
        "valueType": "boolean",
        "readOnly": false
    },
    {
        "name": "isAnimal",
        "displayName": "Is Animal",
        "description": "Is this animal an animal? [Read-only]",
        "value": true,
        "valueType": "boolean",
        "readOnly": true
    },
    {
        "name": "classification",
        "displayName": "Classification",
        "description": "",
        "value": "Vertebrates",
        "valueType": "string",
        "valueItems": [
            "Vertebrates",
            "Invertebrates",
            "Unknown"
        ]
    },
    {
        "name": "color",
        "displayName": "Color",
        "description": "The hex color code for the animal.",
        "readOnly": false,
        "value": "#FF0000",
        "regex": "^#([A-Fa-f0-9]{6})$",
        "valueType": "string"
    },
    {
        "name": "file",
        "displayName": "File",
        "description": "",
        "value": "",
        "valueType": "asset",
        "readOnly": false
    }
];

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
    state = {
        activeNode: null,
        branch: null,
        leftMenu: true,
        rightMenu: true,
        dialogOpened: false,
        scale: 0.6,
        scrollPos: {x: 0, y: 0}
    };

    //constructor(props) {
    //    super(props);
    //}

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

    onLeftMenuOpen = () => {
        this.setState({leftMenu: true});
    };

    onLeftMenuClose = () => {
        this.setState({leftMenu: false});
    };

    onRightMenuOpen = () => {
        this.setState({rightMenu: true});
    };

    onRightMenuClose = () => {
        this.setState({rightMenu: false});
    };

    onOpenDialog = () => {
        this.setState({dialogOpened: true});
    };

    onScroll = (event) => {
        this.setState({scrollPos: {x: event.target.scrollLeft, y: event.target.scrollTop}});
    };

    render() {
        const {classes} = this.props;
        const {activeNode, branch} = this.state;
        const [owner, name] = this.props.projectId.split('+');

        if (typeof activeNode !== 'string') {
            return (
                <div style={{position: 'absolute', top: '50%', width: '100%'}}>
                    <LinearProgress/>
                    <br/>
                    <LinearProgress color="accent"/>
                </div>);
        }

        return (
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%'
            }}>
                <PartBrowserDragPreview scale={this.state.scale}/>
                <AppBar>
                    <Toolbar disableGutters={this.state.leftMenu}>
                        <IconButton color="contrast" aria-label="open side menu" onClick={this.onLeftMenuOpen}>
                            <MenuIcon/>
                        </IconButton>
                        <Typography type="title" color="inherit" noWrap>
                            {`Branch ${branch} open for ${owner} / ${name}`}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer type="persistent" anchor="left" open={this.state.leftMenu}
                        classes={{paper: classes.drawerPaper}}>
                    <IconButton onClick={this.onLeftMenuClose}>
                        <ChevronLeftIcon/>
                    </IconButton>
                    <PartBrowser activeNode={activeNode} gmeClient={this.props.gmeClient} scale={this.state.scale}/>
                </Drawer>

                <div
                    onScroll={this.onScroll}
                    style={{
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100vh',
                        position: 'absolute',
                        overflow: 'auto'
                    }}>
                    {/*{this.state.rightMenu ?*/}
                        {/*<Button onClick={this.onRightMenuClose}>*/}
                            {/*HIDE ATTRIBUTES*/}
                        {/*</Button>*/}
                        {/*:*/}
                        {/*<Button onClick={this.onRightMenuOpen}>*/}
                            {/*SHOW ATTRIBUTES*/}
                        {/*</Button>*/}
                    {/*}*/}
                    {/*<Button onClick={this.onOpenDialog}>PopUpDialog</Button>*/}
                    <Canvas activeNode={this.state.activeNode} gmeClient={this.props.gmeClient}
                            scrollPos={this.state.scrollPos} scale={this.state.scale}/>
                </div>
                <Drawer type="persistent" anchor="right" open={this.state.rightMenu}
                        classes={{paper: classes.drawerPaper}}>
                    <IconButton onClick={this.onRightMenuClose}>
                        <ChevronLeftIcon/>
                    </IconButton>
                    <AttributeEditor activeNode={activeNode} gmeClient={this.props.gmeClient}/>
                </Drawer>
                {this.state.dialogOpened ? (<PluginConfigDialog configDescriptor={testConfig}
                                                                onReady={(config) => {
                                                                    this.setState({dialogOpened: false});
                                                                }}

                                                                onCancel={() => {
                                                                    console.log('canceled');
                                                                    this.setState({dialogOpened: false});
                                                                }}/>) : <div></div>}
            </div>
        );
    }
}

Project.propTypes = {
    gmeClient: PropTypes.object.isRequired,
    projectId: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(DragDropContext(HTML5Backend)(Project));