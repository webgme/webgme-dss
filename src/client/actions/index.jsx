export const setActiveNode = activeNode => ({
    type: 'SET_ACTIVE_NODE',
    activeNode,
});

export const setActiveSelection = activeSelection => ({
    type: 'SET_ACTIVE_SELECTION',
    activeSelection,
});

export const toggleLeftDrawer = (show) => {
    if (show) {
        return {
            type: 'SHOW_LEFT_DRAWER',
        };
    }
    return {
        type: 'HIDE_LEFT_DRAWER',
    };
};

export const toggleRightDrawer = (show) => {
    if (show) {
        return {
            type: 'SHOW_RIGHT_DRAWER',
        };
    }
    return {
        type: 'HIDE_RIGHT_DRAWER',
    };
};

export const setScale = scale => ({
    type: 'SET_SCALE',
    scale,
});

export const addPlotVariable = variable => ({
    type: 'ADD_PLOT_VARIABLE',
    variable,
});

export const removePlotVariable = variable => ({
    type: 'REMOVE_PLOT_VARIABLE',
    variable,
});

export const clearPlotVariables = () => ({
    type: 'CLEAR_PLOT_VARIABLES',
});

export const setPlotNode = nodeId => ({
    type: 'SET_PLOT_NODE',
    nodeId,
});

export const setSimResData = simRes => ({
    type: 'SET_SIM_RES_DATA',
    simRes,
});

export const setResultNode = resultNode => ({
    type: 'SET_RESULT_NODE',
    resultNode,
});

export const toggleModelingView = (show) => {
    if (show) {
        return {
            type: 'MODELING_VIEW',
        };
    }
    return {
        type: 'SIMULATION_VIEW',
    };
};

export const setSystemWaiting = systemWaiting => ({
    type: 'SET_SYSTEM_WAITING',
    systemWaiting,
});

export const setCurrentUser = currentUser => ({
    type: 'SET_CURRENT_USER',
    currentUser,
});

export const setIdToDisplayName = userIdToDisplayName => ({
    type: 'SET_ID_TO_DISPLAY_NAME_MAP',
    userIdToDisplayName,
});
