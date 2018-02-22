import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import logo from '../logo.svg';

const MIN_SPIN_TIME = 800;

class SyncIndicator extends Component {
    static propTypes = {
        gmeClient: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);

        this.STATUS = props.gmeClient.CONSTANTS.STORAGE.BRANCH_STATUS;
        this.spinnerTimeout = null;
        this.selectingBranch = false;
    }

    state = {
        showInSync: true,
        status: 'SYNC',
    };

    componentDidMount() {
        const {gmeClient} = this.props;

        gmeClient.addEventListener(gmeClient.CONSTANTS.BRANCH_STATUS_CHANGED, this.atNewBranchStatus);
    }

    componentWillUnmount() {
        const {gmeClient} = this.props;

        gmeClient.removeEventListener(gmeClient.CONSTANTS.BRANCH_STATUS_CHANGED, this.atNewBranchStatus);
    }

    atNewBranchStatus = (_, eventData) => {
        const {status} = eventData;

        if (status === this.STATUS.SYNC) {
            if (!this.spinnerTimeout) {
                this.setState({
                    status,
                    showInSync: true,
                });
            } else {
                this.setState({
                    status,
                });
            }
        } else if (this.spinnerTimeout) {
            this.setState({status});
        } else {
            this.spinnerTimeout = setTimeout(() => {
                this.spinnerTimeout = null;
                this.setState({
                    showInSync: this.state.status === this.STATUS.SYNC,
                });
            }, MIN_SPIN_TIME);

            this.setState({
                status,
                showInSync: false,
            });
        }

        if (status === this.STATUS.AHEAD_NOT_SYNC && !this.selectingBranch) {
            // TODO: We can consider attempting to auto-merge..
            this.selectingBranch = true;
            this.props.gmeClient.selectBranch('master', null, (err) => {
                if (err) {
                    console.error(err);
                }

                this.selectingBranch = false;
            });
        }
    }

    render() {
        const {showInSync} = this.state;
        //const inSync = status === this.STATUS.SYNC;

        return (
            <Link to="/" style={{textDecoration: 'none'}}>
                <img
                    src={logo}
                    alt="logo"
                    style={{
                        height: 40,
                        marginLeft: -15,
                        marginRight: 30,
                        animation: showInSync ? undefined : 'logo-spin infinite 0.8s linear',
                    }}
                />
            </Link>
        );
    }
}

export default SyncIndicator;
