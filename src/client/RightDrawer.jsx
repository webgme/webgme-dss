import React, {Component} from 'react';
import PropTypes from 'prop-types';

import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import {withStyles} from 'material-ui/styles';

import AttributeEditor from './AttributeEditor';

const SIDE_PANEL_WIDTH = 300;
const HEADER_HEIGHT = 64;

const styles = {
    drawerPaper: {
        width: SIDE_PANEL_WIDTH,
        overflow: 'auto',
        top: HEADER_HEIGHT
    }
};

class RightDrawer extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        selection: PropTypes.array.isRequired,
        scale: PropTypes.number.isRequired,
        open: PropTypes.bool.isRequired,

        classes: PropTypes.object.isRequired
    };

    render() {
        const {classes, selection, gmeClient, scale, open} = this.props;

        return (
            <div>
                <Drawer type="persistent" anchor="right"
                        open={open && selection.length > 0}
                        classes={{paper: classes.drawerPaper}}
                        onMouseOver={() => {console.log('dispatch: reset right drawer timer')}}>
                    <IconButton onClick={() => {console.log('dispatch hiding right drawer')}}>
                        <ChevronLeftIcon/>
                    </IconButton>
                    <AttributeEditor selection={selection} gmeClient={gmeClient}/>
                </Drawer>
            </div>
        );
    }
}


export default withStyles(styles)(RightDrawer);