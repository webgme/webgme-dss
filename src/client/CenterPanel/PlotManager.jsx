import React, {Component} from 'react';
import PropTypes from 'prop-types';
import update from 'immutability-helper';

import IconButton from 'material-ui/IconButton';
import OpenInNew from 'material-ui-icons/OpenInNew';
import AddCircle from 'material-ui-icons/AddCircle';

import PortalWindow from '../gme/PortalWindow';
import Plotter from './Plotter';
import CheckboxList from '../gme/CheckboxList';
import colorHash from '../gme/utils/colorHash';

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

        for (let i = 1; i <= Object.keys(plotWindows).length + 1; i += 1) {
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
                $unset: [id],
            }),
        };

        if (id === latestWindowId) {
            newState.latestWindowId = windowIds.find(windowId => windowId !== id);
        }

        this.setState(newState);
    }

    plotVariableCheckChange = windowId => (varName, event, checked) => {
        const {plotWindows} = this.state;

        let varAddOrRemove;

        if (checked) {
            varAddOrRemove = {
                $push: [varName],
            };
        } else {
            varAddOrRemove = {
                $splice: [[plotWindows[windowId].variables.indexOf(varName), 1]],
            };
        }

        this.setState({
            latestWindowId: windowId,
            plotWindows: update(plotWindows, {
                [windowId]: {
                    variables: varAddOrRemove,
                },
            }),
        });
    }

    render() {
        const {variables, simRes} = this.props;
        const {docked, plotWindows} = this.state;

        // FIXME: Problem mutating there? It's only sorting though...
        variables.sort();

        const toggleDockedBtn = (
            <IconButton
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 5,
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

        const windowIds = Object.keys(plotWindows).sort();

        const portals = windowIds.map(windowId => (
            <PortalWindow
                key={windowId}
                onClose={() => this.removePlotWindow(windowId)}
                windowFeatures={{
                    height: 400,
                    width: 800,
                }}
            >
                <title>{`Plot window ${windowId}`}</title>
                <h1>{`Plot window ${windowId}`}:</h1>
                <Plotter variables={plotWindows[windowId].variables} simRes={simRes}/>
            </PortalWindow>
        ));

        const selectors = windowIds.map((windowId) => {
            const checkBoxes = variables.map(varName => ({
                id: varName,
                isChecked: plotWindows[windowId].variables.includes(varName),
                cbStyle: {
                    color: colorHash(varName).rgb,
                    height: 36,
                },
            }));

            return (
                <CheckboxList
                    key={windowId}
                    title={`Plot window ${windowId}:`}
                    items={checkBoxes}
                    onCheckedChange={this.plotVariableCheckChange(windowId)}
                />
            );
        });

        const addWindowBtn = (
            <IconButton
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                }}
                onClick={this.addPlotWindow}
            >
                <AddCircle/>
            </IconButton>
        );

        return (
            <div style={{
                height: 300,
            }}
            >
                {toggleDockedBtn}
                {addWindowBtn}
                <div style={{
                    display: 'inline-flex',
                    paddingLeft: 50,
                    paddingTop: 20,
                    height: 'calc(100% - 20px)',
                    width: 'calc(100% - 50px)',
                    overflow: 'auto',
                }}
                >
                    {selectors}
                </div>
                {portals}
            </div>
        );
    }
}

export default PlotManager;
