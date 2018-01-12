import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import logo from './logo.svg';
import './App.css';
import Projects from './Projects';
import Project from './Project';


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
        let content = <div/>;

        if (initialConnect) {
            content = (
                <div>
                    <Route exact={true} path="/" render={() => {
                            return <Projects gmeClient={window.gmeClient}/>;
                        }}/>
                    <Route path="/p/:owner/:name" render={ ({match}) => (
                            <Project projectId={`${match.params.owner}+${match.params.name}`}
                                gmeClient={window.gmeClient}/>
                        )}/>
                </div>);
        }

        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className={initialConnect ? "App-logo" : "App-logo-loading"} alt="logo"/>
                    <h1 className="App-title">{initialConnect ? "Welcome to WebGME-DSS" : "Connecting to WebGME"}</h1>
                </header>
                <Router>
                    {content}
                </Router>
            </div>
        );
    }
}
