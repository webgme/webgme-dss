// From libraries
/* eslint-env browser */
/* global window */
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import superagent from 'superagent';

// Own modules
import reducers from './reducers';
import User from './containers/HeaderPanel/User';

import logo from './logo.svg';
import './App.css';
import Projects from './StartPage/Projects';
import Project from './Project';
import ModalSpinner from './gme/BaseComponents/ModalSpinner';

import {setCurrentUser, setIdToDisplayName} from './actions';

function getSimulationToolDesc() {
    let result = ' only supports code generation.';
    if (typeof window.gmeClient !== 'undefined' &&
        typeof window.gmeClient.gmeConfig.plugin !== 'undefined' &&
        typeof window.gmeClient.gmeConfig.plugin.SystemSimulator !== 'undefined') {
        switch (window.gmeClient.gmeConfig.plugin.SystemSimulator.simulationTool) {
            case 'JModelica.org':
                result = ' runs JModelica.org on the backend. Make sure to read the license' +
                    ' on their website before simulating any models.';
                break;
            case 'OpenModelica':
                result = ' runs OpenModelica on the backend. Make sure to read the license' +
                    ' on their website before simulating any models.';
                break;
            default:
                break;
        }
    }

    return result;
}

const theme = createMuiTheme({
    palette: {
        type: 'light', // dark
    },
});

/* eslint-disable */
const store = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
/* eslint-enable */

export default class App extends Component {
    state = {
        initialConnect: false,
        waiting: false,
    };

    componentDidMount() {
        store.subscribe(this.stateChange);
        const mountElm = document.getElementById('mounted-path');
        let mountedPath = '';
        if (mountElm && mountElm.getAttribute('content')) {
            mountedPath = mountElm.getAttribute('content');
        }

        window.onGMEInit = () => {
            window.gmeClient = new window.GME.classes.Client(window.GME.gmeConfig);
            window.gmeClient.mountedPath = mountedPath;
            superagent.get(mountedPath + '/api/user')
                .end((err, userRes) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    superagent.get(mountedPath + '/api/users')
                        .query({displayName: true})
                        .end((err2, usersMapRes) => {
                            if (err2) {
                                console.error(err2);
                                return;
                            }

                            window.gmeClient.connectToDatabase((connErr) => {
                                if (connErr) {
                                    console.error(connErr);
                                    return;
                                }

                                store.dispatch(setCurrentUser(userRes.body));

                                const idMap = {};
                                usersMapRes.body.forEach((uData) => {
                                    idMap[uData._id] = uData.displayName;
                                });

                                store.dispatch(setIdToDisplayName(idMap));

                                this.setState({initialConnect: true});
                            });
                        });
                });
        };
    }

    stateChange = () => {
        const newState = store.getState();
        this.setState({waiting: newState.systemWaiting});
    };

    render() {
        const {initialConnect, waiting} = this.state;
        let content = (
            <header className="App-header">
                <img src={logo} className="App-logo-loading" alt="logo"/>
                <h1 className="App-title">Connecting to WebGME</h1>
            </header>);

        if (initialConnect) {
            content = (
                <div style={{backgroundColor: 'white'}}>
                    <Route
                        exact
                        path={`${window.gmeClient.mountedPath}/`}
                        render={() => (
                            <div>
                                <header className="App-header">
                                    <a href="https://webgme.org">
                                        <img src={logo} className="App-logo" alt="logo"/>
                                    </a>
                                    <h1 className="App-title">Welcome to WebGME-DSS</h1>
                                    <p style={{
                                        color: 'lightgrey',
                                        maxWidth: 400,
                                        textAlign: 'center',
                                        display: 'inline-block',
                                        fontSize: 14,
                                    }}
                                    >WebGME Dynamic Systems Studio is a graphical editor for Modelica<sup>®</sup> with
                                        simulation support using
                                        <a
                                            style={{color: '#8e9def'}}
                                            href="https://jmodelica.org/"
                                        > JModelica.org
                                        </a> or <a
                                            style={{color: '#8e9def'}}
                                            href="https://openmodelica.org/"
                                        >OpenModelica
                                        </a>. This deployment {getSimulationToolDesc()}
                                    </p>
                                </header>
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 20,
                                }}
                                >
                                    <User color="lightgrey" gmeClient={window.gmeClient}/>
                                </div>
                                <Projects gmeClient={window.gmeClient}/>
                            </div>
                        )}
                    />
                    <Route
                        path={`${window.gmeClient.mountedPath}/p/:owner/:name`}
                        render={({match}) => (
                            <Project
                                projectId={`${match.params.owner}+${match.params.name}`}
                                gmeClient={window.gmeClient}
                            />
                        )}
                    />
                </div>);
        }

        return (
            <Provider store={store}>
                <div className="App">
                    <Router>
                        <MuiThemeProvider theme={theme}>
                            {content}
                            <ModalSpinner visible={waiting}/>
                        </MuiThemeProvider>
                    </Router>
                </div>
            </Provider>
        );
    }
}
