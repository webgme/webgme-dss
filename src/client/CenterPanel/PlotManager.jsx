import React, {Component} from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import IconButton from 'material-ui/IconButton';
import OpenInNew from 'material-ui-icons/OpenInNew';

import PortalWindow from '../gme/PortalWindow';
import Plotter from './Plotter';

/* eslint-disable */
class PlotManager extends Component {
    /* eslint-enable */
    static propTypes = {
        variables: PropTypes.arrayOf(PropTypes.string).isRequired,
        simRes: PropTypes.object.isRequired,
    };

    state = {
        docked: true,
        latestWindowId: null,
        plotWindows: {},
    };

    componentWillReceiveProps(nextProps) {
        const {plotWindows, latestWindowId} = this.state;
        const windowIds = Object.keys(plotWindows);

        if (windowIds.length > 0) {
            // Filter invalid ones and add new ones.
            const newPlotVariables = nextProps.variables.filter(varName => !this.props.variables.includes(varName));
            const updateDesc = {};
            windowIds.forEach((windowId) => {
                let windowVariables = plotWindows[windowId].variables
                    .filter(varName => nextProps.variables.includes(varName));

                if (windowId === latestWindowId) {
                    windowVariables = windowVariables.concat(newPlotVariables);
                }

                updateDesc[windowId] = {
                    $set: {
                        variables: windowVariables,
                    },
                };
            });

            this.setState({plotWindows: update(this.state.plotWindows, updateDesc)});
        }
    }

    toggleDocked = () => {
        const {variables} = this.props;
        const {docked} = this.state;

        const newState = {
            docked: !docked,
            latestWindowId: null,
            plotWindows: {},
        };

        if (docked) {
            newState.plotWindows['1'] = {
                variables,
            };

            newState.latestWindowId = '1';
        }

        this.setState(newState);
    };

    addPlotWindow = () => {
        const {plotWindows} = this.state;
        let id;

        for (let i = 1; i <= Object.keys(plotWindows).length; i += 1) {
            if (!plotWindows[i]) {
                id = i.toString();
                break;
            }
        }

        this.setState({
            plotWindows: update(plotWindows, {
                [id]: {
                    $set: {variables: []},
                },
            }),
            latestWindowId: id,
        });
    }

    removePlotWindow = (id) => {
        const {plotWindows, latestWindowId} = this.state;
        const windowIds = Object.keys(plotWindows);

        if (windowIds.length === 1) {
            // Last window is removed - we are no longer undocked.
            this.toggleDocked();
            return;
        }

        const newState = {
            plotWindows: update(plotWindows, {
                $unset: id,
            }),
        };

        if (id === latestWindowId) {
            newState.latestWindowId = windowIds.find(windowId => windowId !== id);
        }

        this.setState(newState);
    };

    render() {
        const {variables, simRes} = this.props;
        const {docked, plotWindows} = this.state;

        const toggleDockedBtn = (
            <IconButton
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                }}
                onClick={this.toggleDocked}
            >
                <OpenInNew style={{
                    transform: `rotate(${docked ? 0 : 180}deg)`,
                }}
                />
            </IconButton>
        );

        if (docked) {
            return (
                <div>
                    {toggleDockedBtn}
                    <Plotter variables={variables} simRes={simRes}/>
                </div>);
        }

        const portals = Object.keys(plotWindows).map((windowId) => {
            return (
                <PortalWindow
                    key={windowId}
                    onClose={() => this.removePlotWindow(windowId)}
                >
                    <h1>{windowId}:</h1>
                    <Plotter variables={plotWindows[windowId].variables} simRes={simRes}/>
                </PortalWindow>
            );
        });

        return (
            <div style={{
                height: 300,
            }}
            >
                {toggleDockedBtn}
                {portals}
            </div>
        );
    }
}

export default PlotManager;
