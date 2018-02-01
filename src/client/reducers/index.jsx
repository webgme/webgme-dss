import { combineReducers } from 'redux';

const activeNode = (state = null, action) => {
    if (action.type === 'SET_ACTIVE_NODE') {
        return action.activeNode;
    }

    return state;
};

const activeSelection = (state = [], action) => {
    if (action.type === 'SET_ACTIVE_SELECTION') {
        return action.activeSelection;
    }

    return state;
};

const leftDrawer = (state = false, action) => {
    if (action.type === 'SHOW_LEFT_DRAWER') {
        return true;
    } else if (action.type === 'HIDE_LEFT_DRAWER') {
        return false;
    }

    return state;
};

const rightDrawer = (state = false, action) => {
    if (action.type === 'SHOW_RIGHT_DRAWER') {
        return true;
    } else if (action.type === 'HIDE_RIGHT_DRAWER') {
        return false;
    }

    return state;
};

const scale = (state = 0.6, action) => {
    if (action.type === 'SET_SCALE') {
        return action.scale;
    }

    return state;
};

const modelingView = (state = true, action) => {
    if (action.type === 'MODELING_VIEW') {
        return true;
    } else if (action.type === 'SIMULATION_VIEW') {
        return false;
    }

    return state;
};

const plotData = (state = [], action) => {
    if (action.type === 'SET_PLOT_DATA') {
        return action.data;
    }

    return state;
};

export default combineReducers({
    activeNode,
    activeSelection,
    leftDrawer,
    rightDrawer,
    scale,
    modelingView,
    plotData
})