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

export const setPlotNode = (nodeId) => {
    return {
        type: 'SET_PLOT_NODE',
        nodeId
    };
};

export const setSimResData = (simRes) => {
    return {
        type: 'SET_SIM_RES_DATA',
        simRes
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

export const setSystemWaiting = systemWaiting => {
    return {
        type: 'SET_SYSTEM_WAITING',
        systemWaiting
    };
};