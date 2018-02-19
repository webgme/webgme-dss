import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import Drawer from 'material-ui/Drawer';
import IconButton from 'material-ui/IconButton';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft';
import {withStyles} from 'material-ui/styles';

import AttributeEditor from './AttributeEditor';
import AttributeEditorIcon from './AttributeEditorIcon';
import {toggleRightDrawer} from '../actions';
import {sideDrawer as styles} from '../classes';

const mapStateToProps = state => ({
    open: state.rightDrawer,
    selection: state.activeSelection,
});

const mapDispatchToProps = dispatch => ({
    hide: () => {
        dispatch(toggleRightDrawer(false));
    },
});

class RightDrawer extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,

        selection: PropTypes.arrayOf(PropTypes.string).isRequired,
        open: PropTypes.bool.isRequired,

        hide: PropTypes.func.isRequired,

        classes: PropTypes.object.isRequired,
    };

    render() {
        const {
            classes, selection, gmeClient, open,
        } = this.props;

        return (
            <div>
                <Drawer
                    type="persistent"
                    anchor="right"
                    open={open && selection.length > 0}
                    classes={{paper: classes.drawerPaper}}
                >
                    <IconButton onClick={this.props.hide}>
                        <ChevronLeftIcon/>
                    </IconButton>
                    <AttributeEditor selection={selection} gmeClient={gmeClient} fullWidthWidgets hideReadOnly>
                        <AttributeEditorIcon gmeClient={gmeClient} nodeId={null}/>
                    </AttributeEditor>
                </Drawer>
            </div>
        );
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(RightDrawer));
