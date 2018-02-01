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

export const setPlotData = data => {
    return {
        type: 'SET_PLOT_DATA',
        data
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