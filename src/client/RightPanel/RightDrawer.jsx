import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import {withStyles} from 'material-ui/styles';

import AttributeEditor from './AttributeEditor';
import {toggleRightDrawer} from '../actions';

const SIDE_PANEL_WIDTH = 300;
const HEADER_HEIGHT = 64;

const styles = {
    drawerPaper: {
        width: SIDE_PANEL_WIDTH,
        overflow: 'auto',
        top: HEADER_HEIGHT
    }
};

const mapStateToProps = state => {
    return {
        open: state.rightDrawer,
        selection: state.activeSelection
    }
};

const mapDispatchToProps = dispatch => {
    return {
        hide: () => {
            dispatch(toggleRightDrawer(false));
        }
    }
};

class RightDrawer extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,

        selection: PropTypes.array.isRequired,
        open: PropTypes.bool.isRequired,

        classes: PropTypes.object.isRequired
    };

    render() {
        const {classes, selection, gmeClient, open} = this.props;

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


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RightDrawer));