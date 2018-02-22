import {combineReducers} from 'redux';
import update from 'immutability-helper';

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

const leftDrawer = (state = true, action) => {
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

const modelingView = (state = false, action) => {
    if (action.type === 'MODELING_VIEW') {
        return true;
    } else if (action.type === 'SIMULATION_VIEW') {
        return false;
    }

    return state;
};

const systemWaiting = (state = false, action) => {
    if (action.type === 'SET_SYSTEM_WAITING') {
        return action.systemWaiting;
    }
    return state;
};
// const initialUserState = {hasFetched: false, isFetching: false, user: {}};
// const currentUser = (state = initialUserState, action) => {
//     switch (action.type) {
//         case 'USER_RECEIVED':
//             return update(state, {
//                 hasFetched: {$set: true},
//                 isFetching: {$set: false},
//                 user: {$set: action.user}
//             });
//         case 'USER_REQUESTED':
//             return update(state, {
//                 isFetching: {$set: true}
//             });
//         default:
//             return state;
//     }
// };

const plotData = (state = {nodeId: null, variables: [], simRes: null}, action) => {
    switch (action.type) {
        case 'ADD_PLOT_VARIABLE':
            return update(state, {
                variables: {$push: [action.variable]},
            });
        case 'REMOVE_PLOT_VARIABLE':
            return update(state, {
                variables: {$splice: [[state.variables.indexOf(action.variable), 1]]},
            });
        case 'CLEAR_PLOT_VARIABLES':
            return update(state, {
                variables: {$set: []},
            });
        case 'SET_PLOT_NODE':
            return update(state, {
                nodeId: {$set: action.nodeId},
            });
        case 'SET_SIM_RES_DATA':
            return update(state, {
                simRes: {$set: action.simRes},
            });
        default:
            return state;
    }
};

const resultNode = (state = null, action) => {
    if (action.type === 'SET_RESULT_NODE') {
        return action.resultNode;
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
    plotData,
    resultNode,
    systemWaiting,
});
