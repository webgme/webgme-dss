import {connect} from 'react-redux';

import ProjectHistory from '../../CenterPanel/Canvas/Canvas';
import {setActiveSelection, toggleRightDrawer} from '../../../actions';

const mapStateToProps = state => ({
    activeNode: state.activeNode,
    selection: state.activeSelection,
    scale: state.scale,
});

const mapDispatchToProps = dispatch => ({
    hide: () => {
        dispatch(toggleRightDrawer(false));
    },
    clearSelection: () => {
        dispatch(setActiveSelection([]));
        dispatch(toggleRightDrawer(false));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectHistory);
