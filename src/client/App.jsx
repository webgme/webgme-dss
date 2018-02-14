// From libraries
import React, {Component} from 'react';

import {Provider} from 'react-redux'
import {createStore} from 'redux'

import {BrowserRouter as Router, Route} from 'react-router-dom';

import {MuiThemeProvider, createMuiTheme} from 'material-ui/styles';

import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import User from './HeaderPanel/User';
// Own modules
import reducers from "./reducers";

import logo from './logo.svg';
import './App.css';
import Projects from './StartPage/Projects';
import Project from './Project';
import ModalSpinner from './gme/BaseComponents/ModalSpinner';

const theme = createMuiTheme({
    palette: {
        type: 'light' //dark
    }
});

let store = createStore(reducers);

export default class App extends Component {
    state = {
        initialConnect: false,
        waiting: false
    };

    stateChange = () => {
        const newState = store.getState();
        this.setState({waiting: newState.systemWaiting});
    };

    componentDidMount() {
        store.subscribe(this.stateChange);

        window.onGMEInit = () => {
            window.gmeClient = new window.GME.classes.Client(window.GME.gmeConfig);
            window.gmeClient.connectToDatabase((err) => {
                if (err) {
                    console.error(err);
                    return;
                }

                this.setState({initialConnect: true});
            });
        };
    }

    render() {
        const {initialConnect, waiting} = this.state;
        let content = (
            <header className="App-header">
                <img src={logo} className={"App-logo-loading"} alt="logo"/>
                <h1 className="App-title">{"Connecting to WebGME"}</h1>
            </header>);

        if (initialConnect) {
            content = (
                <div>
                    <Route exact={true} path="/" render={() => {
                        return (
                            <div>
                                <header className="App-header">
                                    <img src={logo} className={"App-logo"} alt="logo"/>
                                    <h1 className="App-title">{"Welcome to WebGME-DSS"}</h1>
                                    <p style={{
                                        color: 'lightgrey',
                                        maxWidth: 400,
                                        textAlign: 'center',
                                        display: 'inline-block',
                                        fontSize: 14
                                    }}>WebGME Dynamic Systems Studio is a design studio for Modelica<sup>®</sup> with
                                        planned simulation backed-end support from the OpenModelica compiler...</p>
                                </header>
                                <Toolbar disableGutters={true}>
                                    <Typography style={{flex: 1}}/>
                                    <User/>
                                </Toolbar>
                                <Projects gmeClient={window.gmeClient}/>
                            </div>
                        );
                    }}/>
                    <Route path="/p/:owner/:name" render={({match}) => (
                        <Project projectId={`${match.params.owner}+${match.params.name}`}
                                 gmeClient={window.gmeClient}/>
                    )}/>
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
