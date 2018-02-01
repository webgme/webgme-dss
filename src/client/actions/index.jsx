export const setActiveNode = activeNode => {
    return {
        type: 'SET_ACTIVE_NODE',
        activeNode
    };
};

export const setActiveSelection = activeSelection => {
    return {
        type: 'SET_ACTIVE_SELECTION',
        activeSelection
    };
};

export const toggleLeftDrawer = show => {
    if (show) {
        return {
            type: 'SHOW_LEFT_DRAWER'
        };
    } else {
        return {
            type: 'HIDE_LEFT_DRAWER'
        };
    }
};

export const toggleRightDrawer = show => {
    if (show) {
        return {
            type: 'SHOW_RIGHT_DRAWER'
        };
    } else {
        return {
            type: 'HIDE_RIGHT_DRAWER'
        };
    }
};

export const setScale = scale => {
    return {
        type: 'SET_SCALE',
        scale
    };
};

export const addPlotVariable = variable => {
    return {
        type: 'ADD_PLOT_VARIABLE',
        variable
    };
};

export const removePlotVariable = variable => {
    return {
        type: 'REMOVE_PLOT_VARIABLE',
        variable
    };
};

export const clearPlotVariables = () => {
    return {
        type: 'CLEAR_PLOT_VARIABLES'
    };
};

export const setPlotNode = () => {
    return {
        type: 'CLEAR_PLOT_VARIABLES'
    };
};

export const toggleModelingView = show => {
    if (show) {
        return {
            type: 'MODELING_VIEW'
        };
    } else {
        return {
            type: 'SIMULATION_VIEW'
        };
    }
};