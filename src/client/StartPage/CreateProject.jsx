/* globals window */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import superagent from 'superagent';

import {connect} from 'react-redux';

import ProjectSeedCards from 'webgme-react-components/src/components/ProjectSeedCards';

import {setSystemWaiting} from '../actions';
import DomainSelector from '../Dialogs/DomainSelector';
import TEMPLATE_PROJECTS from './templateProjects.json';

// http://www.publicdomainpictures.net

const styles = theme => ({
    cardContent: {
        minHeight: 160,
    },
    media: {
        height: 120,
    },
    progress: {
        margin: `0 ${theme.spacing.unit * 2}px`,
    },
});

const mapStateToProps = (/* state */) => ({});

const mapDispatchToProps = dispatch => ({
    setSystemWaiting: (isWaiting) => {
        dispatch(setSystemWaiting(isWaiting));
    },
});

class CreateProject extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
        projects: PropTypes.arrayOf(PropTypes.object),
        history: PropTypes.object.isRequired,
        setSystemWaiting: PropTypes.func.isRequired,
    };

    static defaultProps = {
        projects: null,
    };

    state = {
        showDialog: false,
        createData: null,
    };

    onCreateNewClick = (createData) => {
        this.setState({
            createData,
            showDialog: true,
        });
    };

    onCreateNewProject = (data) => {
        const {gmeClient, history} = this.props;

        this.setState({showDialog: false});
        if (!data) {
            // Cancelled
            return;
        }

        // console.log('create data:', data);

        const path = [
            window.location.origin + gmeClient.mountedPath,
            gmeClient.gmeConfig.rest.components.DomainManager.mount,
            'createProject',
        ].join('/');

        this.props.setSystemWaiting(true);

        superagent.post(path)
            .send({
                projectName: data.name,
                domains: data.domains,
            })
            .end((err, result) => {
                if (err) {
                    // TODO: we need to show these errors
                    console.error(err);
                } else {
                    // console.log(result);
                    const [owner, name] = result.body.projectId.split('+');
                    history.push(`${gmeClient.mountedPath}/p/${owner}/${name}`);
                }
            });
    };

    render() {
        const {projects, gmeClient} = this.props;

        const {showDialog, createData} = this.state;
        return (
            <div>
                <ProjectSeedCards
                    seedsInfo={TEMPLATE_PROJECTS.map((seedInfo) => {
                        const cpy = JSON.parse(JSON.stringify(seedInfo));
                        cpy.imageUrl = `${gmeClient.mountedPath || ''}${cpy.imageUrl}`;
                        return cpy;
                    })}
                    onCreate={this.onCreateNewClick}
                />

                {showDialog ?
                    <DomainSelector
                        title="Create New Project"
                        onOK={this.onCreateNewProject}
                        onCancel={this.onCreateNewProject}
                        defaultName={createData.defaultName}
                        takenNames={projects
                            .filter(pInfo => pInfo.owner === 'guest') // FIXME: We need to get user info
                            .map(pInfo => pInfo.name)
                        }
                        domains={createData.domains}
                        showDomainSelection={createData.domains.length === 0}
                    /> : null}
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(CreateProject));
