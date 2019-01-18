import React, {Component} from 'react';
import {connect} from 'react-redux';

import {toggleRightDrawer, setActiveSelection} from '../../actions';
import {SVGRegistryBasedCanvasItem}
    from 'webgme-react-components/src/components/SVGRegistryBasedCanvasItem';

const mapStateToProps = state => ({
    scale: state.scale,
    selection: state.activeSelection,
});

const mapDispatchToProps = dispatch => ({
    activateAttributeDrawer: (id) => {
        dispatch(toggleRightDrawer(true));
        dispatch(setActiveSelection([id]));
    },
    selectNode: (id) => {
        dispatch(setActiveSelection([id]));
    },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(SVGRegistryBasedCanvasItem);
