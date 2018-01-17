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

// Own modules
import PartBrowser from './PartBrowser';
import AttributeEditor from './AttributeEditor';
import Canvas from './Canvas';
import PluginConfigDialog from './PluginConfigDialog';

const SIDE_PANEL_WIDTH = 300;

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

class Project extends Component {
    state = {
        activeNode: null,
        branch: null,
        sideMenu: true,
        bottomMenu: true,
        dialogOpened: false
    };

    //constructor(props) {
    //    super(props);
    //}

    componentDidMount() {
        this.props.gmeClient.selectProject(this.props.projectId, 'master', (err) => {
            if (err) {
                console.error(err);
                return;
            }

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

    onOpenDialog = () => {
        this.setState({dialogOpened: true});
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
                <Drawer type="persistent" anchor="left" open={this.state.sideMenu} style={{width: SIDE_PANEL_WIDTH}}>
                    <IconButton onClick={this.onSideMenuClose}>
                        <ChevronLeftIcon/>
                    </IconButton>
                    <div style={{width: SIDE_PANEL_WIDTH, textAlign: 'left'}}>
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
                    <Button onClick={this.onOpenDialog}>PopUpDialog</Button>
                    <div style={{width: 400, height: 400, borderStyle: 'dotted'}}>
                        <Canvas activeNode={this.state.activeNode} gmeClient={this.props.gmeClient}/>
                    </div>
                </div>
                <Drawer type="persistent" anchor="bottom" open={this.state.bottomMenu}
                        onClose={this.onBottomMenuClose}>
                    <AttributeEditor activeNode={activeNode} gmeClient={this.props.gmeClient}/>
                </Drawer>
                {this.state.dialogOpened ? (<PluginConfigDialog configDescriptor={testConfig}
                                                                onReady={(config) => {
                                                                    console.log(config)
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
    projectId: PropTypes.string.isRequired
};

export default DragDropContext(HTML5Backend)(Project);