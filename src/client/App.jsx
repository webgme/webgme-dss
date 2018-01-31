// From libraries
import React, {Component} from 'react';

import { Provider } from 'react-redux'
import { createStore } from 'redux'

import {BrowserRouter as Router, Route} from 'react-router-dom';

import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

// Own modules
import reducers from "./reducers";

import logo from './logo.svg';
import './App.css';
import Projects from './StartPage/Projects';
import Project from './Project';

const theme = createMuiTheme({
    palette: {
        type: 'light' //dark
    }
});

let store = createStore(reducers);

export default class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            initialConnect: false
        }
    }

    componentDidMount() {
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
        const {initialConnect} = this.state;
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
                                </header>
                                <Projects gmeClient={window.gmeClient}/>
                                </div>
                            );
                        }}/>
                    <Route path="/p/:owner/:name" render={ ({match}) => (
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
                        </MuiThemeProvider>
                    </Router>
                </div>
            </Provider>
        );
    }
}
